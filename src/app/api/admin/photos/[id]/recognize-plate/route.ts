import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createOriginalDownloadUrl } from "@/lib/original-storage";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isApiAdmin())) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  const endpoint = process.env.PLATE_RECOGNITION_ENDPOINT;
  const apiKey = process.env.PLATE_RECOGNITION_API_KEY;
  if (!endpoint || !apiKey) return NextResponse.json({ error: "Reconhecimento automático não configurado" }, { status: 503 });
  const { id } = await params;
  const { data: photo } = await supabaseAdmin.from("photos").select("original_path").eq("id", id).maybeSingle();
  if (!photo?.original_path) return NextResponse.json({ error: "Original não encontrado" }, { status: 404 });
  let originalUrl: string;
  try { originalUrl = await createOriginalDownloadUrl(String(photo.original_path), 60); }
  catch { return NextResponse.json({ error: "Não foi possível ler o original" }, { status: 500 }); }
  const isPlateRecognizer = endpoint.includes("platerecognizer.com");
  const body = isPlateRecognizer ? new URLSearchParams({ upload_url: originalUrl, regions: "br" }) : JSON.stringify({ image_url: originalUrl });
  const response = await fetch(endpoint, { method: "POST", headers: { Authorization: `${isPlateRecognizer ? "Token" : "Bearer"} ${apiKey}`, "Content-Type": isPlateRecognizer ? "application/x-www-form-urlencoded" : "application/json" }, body });
  const result = await response.json();
  const plate = String(result.plate || result.plate_text || result.results?.[0]?.plate || "").replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 10);
  if (!response.ok || !plate) return NextResponse.json({ error: "Placa não identificada" }, { status: 422 });
  await supabaseAdmin.from("photos").update({ plate_text: plate }).eq("id", id);
  return NextResponse.json({ plate });
}
