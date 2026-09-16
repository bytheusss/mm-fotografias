import { createHash } from "node:crypto";
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const mode = process.argv[2] || "audit";
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "B2_ENDPOINT",
  "B2_REGION",
  "B2_KEY_ID",
  "B2_APPLICATION_KEY",
  "B2_BUCKET",
];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Variáveis ausentes: ${missing.join(", ")}`);
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const b2 = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});
const bucket = process.env.B2_BUCKET;
const PAGE_SIZE = 200;

function sourceKey(reference) {
  return String(reference || "").replace(/^originals\//, "").replace(/^b2\//, "");
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function rows(backblazeOnly) {
  const found = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase
      .from("photos")
      .select("id,number,original_path,events(slug)")
      .not("original_path", "is", null)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    query = backblazeOnly
      ? query.like("original_path", "b2/%")
      : query.not("original_path", "like", "b2/%");
    const { data, error } = await query;
    if (error) throw error;
    found.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return found;
}

async function head(key) {
  return b2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
}

async function audit() {
  const migrated = await rows(true);
  const pending = await rows(false);
  let verified = 0;
  const invalid = [];
  for (const photo of migrated) {
    const key = sourceKey(photo.original_path);
    try {
      const metadata = await head(key);
      if (!metadata.ContentLength) throw new Error("arquivo vazio");
      verified += 1;
    } catch (error) {
      invalid.push({ id: photo.id, key, error: error instanceof Error ? error.message : String(error) });
    }
  }
  console.log(JSON.stringify({ migrated: migrated.length, verified, pending: pending.length, invalid }, null, 2));
  if (invalid.length) process.exitCode = 2;
}

async function migrate() {
  const pending = await rows(false);
  console.log(`${pending.length} original(is) aguardando migração.`);
  let completed = 0;
  for (const photo of pending) {
    const key = sourceKey(photo.original_path);
    if (!key) {
      console.warn(`[pular] ${photo.id}: caminho vazio`);
      continue;
    }
    const { data, error } = await supabase.storage.from("originals").download(key);
    if (error || !data) throw new Error(`[download] ${key}: ${error?.message || "sem conteúdo"}`);
    const body = Buffer.from(await data.arrayBuffer());
    const digest = sha256(body);
    await b2.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: data.type || "image/jpeg",
      Metadata: { sha256: digest, "supabase-photo-id": String(photo.id) },
    }));
    const uploaded = await head(key);
    if (Number(uploaded.ContentLength) !== body.length || uploaded.Metadata?.sha256 !== digest) {
      throw new Error(`[verificação] ${key}: tamanho ou SHA-256 divergente`);
    }
    const { error: updateError } = await supabase
      .from("photos")
      .update({ original_path: `b2/${key}` })
      .eq("id", photo.id)
      .eq("original_path", photo.original_path);
    if (updateError) throw new Error(`[banco] ${key}: ${updateError.message}`);
    completed += 1;
    console.log(`[${completed}/${pending.length}] copiado, validado e ativado: ${key}`);
  }
  await audit();
}

async function cleanup() {
  if (process.env.CONFIRM_DELETE_SUPABASE !== "SIM_EXCLUIR_ORIGINAIS_VERIFICADOS") {
    console.error("Limpeza bloqueada. Execute somente após auditoria com CONFIRM_DELETE_SUPABASE=SIM_EXCLUIR_ORIGINAIS_VERIFICADOS.");
    process.exit(3);
  }
  const migrated = await rows(true);
  let removed = 0;
  for (const photo of migrated) {
    const key = sourceKey(photo.original_path);
    const remote = await head(key);
    if (!remote.ContentLength) throw new Error(`[verificação] ${key}: destino ausente ou vazio`);
    const { error } = await supabase.storage.from("originals").remove([key]);
    if (error) throw new Error(`[remoção] ${key}: ${error.message}`);
    removed += 1;
    console.log(`[${removed}/${migrated.length}] removido do Supabase: ${key}`);
  }
  console.log(`${removed} original(is) removida(s) do Supabase após verificação no B2.`);
}

try {
  if (mode === "migrate") await migrate();
  else if (mode === "audit") await audit();
  else if (mode === "cleanup") await cleanup();
  else throw new Error(`Modo inválido: ${mode}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  b2.destroy();
}
