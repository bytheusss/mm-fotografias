import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export async function GET() { const { data } = await supabaseAdmin.from("photos").select("id,number,title,thumbnail_path,deleted_at,events(name)").not("deleted_at", "is", null).order("deleted_at", { ascending: false }).limit(200); return NextResponse.json({ photos: data || [] }); }
