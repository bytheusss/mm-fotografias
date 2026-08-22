import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = 24;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } =
    await supabaseAdmin
      .from("photos")
      .select("*", {
        count: "exact",
      })
      .eq("event_id", id)
      .is("deleted_at", null)
      .order("number")
      .range(from, to);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    photos: data,
    total: count,
    page,
    pages: Math.ceil((count || 0) / limit),
  });
}
