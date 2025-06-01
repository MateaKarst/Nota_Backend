// src/app/api/chat/route.ts
import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addCorsHeaders, handlePreflight } from "@/utils/cors";

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sender_id, receiver_id, text } = body;

  if (!sender_id || !receiver_id || !text) {
    const res = NextResponse.json(
      { message: "Missing sender_id, receiver_id, or text" },
      { status: 400 }
    );
    return addCorsHeaders(request, res);
  }

  try {
    // Skip existence check for now

    const { data, error } = await supabaseAdmin
      .from("messages")
      .insert([
        {
          sender_id,
          receiver_id, 
          text,
        },
      ])
      .select()
      .single();

    if (error) {
      const res = NextResponse.json(
        { message: "Error inserting message", error: error.message },
        { status: 500 }
      );
      return addCorsHeaders(request, res);
    }

    const res = NextResponse.json(data, { status: 201 });
    return addCorsHeaders(request, res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const res = NextResponse.json({ message }, { status: 500 });
    return addCorsHeaders(request, res);
  }
}

