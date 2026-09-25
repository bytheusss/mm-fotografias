import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const B2_PREFIX = "b2/";
let configuredCors = "";

type B2NativeAuthorization = {
  accountId: string;
  authorizationToken: string;
  apiUrl: string;
  bucketId: string;
};

function b2Config() {
  const endpoint = process.env.B2_ENDPOINT?.trim();
  const region = process.env.B2_REGION?.trim();
  const accessKeyId = process.env.B2_KEY_ID?.trim();
  const secretAccessKey = process.env.B2_APPLICATION_KEY?.trim();
  const bucket = process.env.B2_BUCKET?.trim();
  if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucket) return null;
  return { endpoint, region, accessKeyId, secretAccessKey, bucket };
}

function b2Client() {
  const config = b2Config();
  if (!config) return null;
  return {
    bucket: config.bucket,
    client: new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    }),
  };
}

function cleanSupabasePath(reference: string) {
  return reference.replace(/^originals\//, "");
}

function cleanB2Key(reference: string) {
  return reference.replace(/^b2\//, "");
}

async function bodyToBuffer(body: unknown): Promise<Buffer> {
  if (!body || typeof body !== "object") throw new Error("Arquivo vazio no armazenamento.");
  const stream = body as { transformToByteArray?: () => Promise<Uint8Array> };
  if (!stream.transformToByteArray) throw new Error("Resposta inválida do armazenamento.");
  return Buffer.from(await stream.transformToByteArray());
}

export function usesBackblaze() {
  return Boolean(b2Config());
}

async function authorizeB2Native(): Promise<B2NativeAuthorization> {
  const config = b2Config();
  if (!config) throw new Error("Backblaze B2 ainda não está configurado.");
  const basic = Buffer.from(`${config.accessKeyId}:${config.secretAccessKey}`).toString("base64");
  const response = await fetch("https://api.backblazeb2.com/b2api/v4/b2_authorize_account", { headers: { Authorization: `Basic ${basic}` }, signal: AbortSignal.timeout(15_000) });
  const result = await response.json() as {
    accountId?: string;
    authorizationToken?: string;
    apiInfo?: { storageApi?: { apiUrl?: string; allowed?: { buckets?: Array<{ id?: string; name?: string | null }> } } };
    message?: string;
  };
  if (!response.ok) throw new Error(result.message || "Não foi possível autorizar o Backblaze.");
  const storageApi = result.apiInfo?.storageApi;
  const bucketId = storageApi?.allowed?.buckets?.find((bucket) => bucket.name === config.bucket)?.id || storageApi?.allowed?.buckets?.find((bucket) => bucket.id)?.id;
  if (!result.accountId || !result.authorizationToken || !storageApi?.apiUrl || !bucketId) throw new Error("O Backblaze não retornou os dados necessários do bucket.");
  return { accountId: result.accountId, authorizationToken: result.authorizationToken, apiUrl: storageApi.apiUrl, bucketId };
}

export async function ensureOriginalUploadCors(requestOrigin?: string | null) {
  if (!b2Config()) return;
  const origins = [
    "https://mm-fotografias.vercel.app",
    process.env.NEXT_PUBLIC_SITE_URL,
    requestOrigin,
    process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
  ].filter((origin, index, list): origin is string => {
    if (!origin || !/^https?:\/\//i.test(origin)) return false;
    return list.indexOf(origin) === index;
  });
  const signature = origins.sort().join("|");
  if (configuredCors === signature) return;
  const authorization = await authorizeB2Native();
  const updateResponse = await fetch(`${authorization.apiUrl}/b2api/v4/b2_update_bucket`, {
    method: "POST",
    headers: { Authorization: authorization.authorizationToken, "Content-Type": "application/json" },
    body: JSON.stringify({
      accountId: authorization.accountId,
      bucketId: authorization.bucketId,
      corsRules: [{
        corsRuleName: "allowMMSiteUploads",
        allowedOrigins: origins,
        allowedHeaders: ["*"],
        allowedOperations: ["b2_upload_file"],
        exposeHeaders: ["ETag", "x-bz-content-sha1"],
        maxAgeSeconds: 3600,
      }],
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!updateResponse.ok) {
    const error = await updateResponse.json().catch(() => ({})) as { message?: string };
    throw new Error(error.message || `Não foi possível configurar o CORS do Backblaze (${updateResponse.status}).`);
  }
  configuredCors = signature;
}

export async function createOriginalUploadTarget(key: string, contentType: string) {
  if (b2Config()) {
    const authorization = await authorizeB2Native();
    const response = await fetch(`${authorization.apiUrl}/b2api/v4/b2_get_upload_url?bucketId=${encodeURIComponent(authorization.bucketId)}`, {
      headers: { Authorization: authorization.authorizationToken },
      signal: AbortSignal.timeout(15_000),
    });
    const upload = await response.json() as { uploadUrl?: string; authorizationToken?: string; message?: string };
    if (!response.ok || !upload.uploadUrl || !upload.authorizationToken) throw new Error(upload.message || "Não foi possível preparar o envio nativo ao Backblaze.");
    return { provider: "b2-native" as const, path: `${B2_PREFIX}${key}`, key, uploadUrl: upload.uploadUrl, uploadToken: upload.authorizationToken, contentType };
  }

  const { data, error } = await supabaseAdmin.storage.from("originals").createSignedUploadUrl(key);
  if (error || !data) throw error || new Error("Não foi possível preparar o upload.");
  return { provider: "supabase" as const, path: key, token: data.token };
}

export async function readOriginal(reference: string) {
  if (reference.startsWith(B2_PREFIX)) {
    const b2 = b2Client();
    if (!b2) throw new Error("Backblaze B2 ainda não está configurado.");
    const response = await b2.client.send(new GetObjectCommand({ Bucket: b2.bucket, Key: cleanB2Key(reference) }));
    return bodyToBuffer(response.Body);
  }

  const { data, error } = await supabaseAdmin.storage.from("originals").download(cleanSupabasePath(reference));
  if (error || !data) throw error || new Error("Original não encontrado no Supabase.");
  return Buffer.from(await data.arrayBuffer());
}

export async function writeOriginal(key: string, body: Buffer, contentType = "image/jpeg") {
  const b2 = b2Client();
  if (b2) {
    await b2.client.send(new PutObjectCommand({ Bucket: b2.bucket, Key: key, Body: body, ContentType: contentType }));
    return `${B2_PREFIX}${key}`;
  }

  const { error } = await supabaseAdmin.storage.from("originals").upload(key, body, { contentType, upsert: false });
  if (error) throw error;
  return `originals/${key}`;
}

export async function createOriginalDownloadUrl(reference: string, expiresIn = 60) {
  if (reference.startsWith(B2_PREFIX)) {
    const b2 = b2Client();
    if (!b2) throw new Error("Backblaze B2 ainda não está configurado.");
    return getSignedUrl(
      b2.client,
      new GetObjectCommand({ Bucket: b2.bucket, Key: cleanB2Key(reference) }),
      { expiresIn },
    );
  }
  const { data, error } = await supabaseAdmin.storage.from("originals").createSignedUrl(cleanSupabasePath(reference), expiresIn);
  if (error || !data?.signedUrl) throw error || new Error("Original não encontrado.");
  return data.signedUrl;
}

export async function deleteOriginal(reference: string) {
  if (reference.startsWith(B2_PREFIX)) {
    const b2 = b2Client();
    if (!b2) return;
    await b2.client.send(new DeleteObjectCommand({ Bucket: b2.bucket, Key: cleanB2Key(reference) }));
    return;
  }
  await supabaseAdmin.storage.from("originals").remove([cleanSupabasePath(reference)]);
}
