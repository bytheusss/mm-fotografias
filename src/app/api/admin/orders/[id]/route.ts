import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } = await params;

    const body = await req.json();

    const update: any = {};

    if (body.status) {
      update.status = body.status;
    }

    if (body.generateToken) {
      update.download_token = randomUUID();
    }

    update.updated_at = new Date().toISOString();

    const { error } =
      await supabaseAdmin
        .from("orders")
        .update(update)
        .eq("id", id);

    if (error) {

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 500,
        }
      );

    }

    return NextResponse.json({
      success: true,
    });

  } catch (err: any) {

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      {
        status: 500,
      }
    );

  }

}