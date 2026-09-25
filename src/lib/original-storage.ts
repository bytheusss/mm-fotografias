import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const B2_PREFIX = "b2/";
let configuredCors = "";

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

export async function ensureOriginalUploadCors(requestOrigin?: string | null) {
  const b2 = b2Client();
  if (!b2) return;
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
  await b2.client.send(new PutBucketCorsCommand({
    Bucket: b2.bucket,
    CORSConfiguration: {
      CORSRules: [{
        AllowedHeaders: ["*"],
        AllowedMethods: ["GET", "HEAD", "PUT"],
        AllowedOrigins: origins,
        ExposeHeaders: ["ETag", "x-bz-content-sha1"],
        MaxAgeSeconds: 3600,
      }],
    },
  }));
  configuredCors = signature;
}

export async function createOriginalUploadTarget(key: string, contentType: string) {
  const b2 = b2Client();
  if (b2) {
    const uploadUrl = await getSignedUrl(
      b2.client,
      new PutObjectCommand({ Bucket: b2.bucket, Key: key, ContentType: contentType }),
      { expiresIn: 15 * 60 },
    );
    return { provider: "b2" as const, path: `${B2_PREFIX}${key}`, uploadUrl };
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
