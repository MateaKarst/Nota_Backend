// src/app/api/messages/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addCorsHeaders, handlePreflight } from "@/utils/cors";

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sender_id = request.headers.get("x-user-id");
  const receiver_id = (await params).id;

  if (!sender_id) {
    const res = NextResponse.json(
      { message: "Missing authenticated user ID" },
      { status: 401 }
    );
    return addCorsHeaders(request, res);
  }

  if (!receiver_id) {
    const res = NextResponse.json(
      { message: "Missing other user ID in URL" },
      { status: 400 }
    );
    return addCorsHeaders(request, res);
  }

  const body = await request.json();
  const { text } = body;

  if (!text) {
    const res = NextResponse.json(
      { message: "Missing text in request body" },
      { status: 400 }
    );
    return addCorsHeaders(request, res);
  }

  try {
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = request.headers.get("x-user-id");
  const otherUserId = (await params).id;

  if (!authUser) {
    const res = NextResponse.json(
      { message: "Missing authenticated user ID" },
      { status: 401 }
    );
    return addCorsHeaders(request, res);
  }

  if (!otherUserId) {
    const res = NextResponse.json(
      { message: "Missing other user ID in URL" },
      { status: 400 }
    );
    return addCorsHeaders(request, res);
  }

  try {
    const filter = [
      `and(sender_id.eq.${authUser},receiver_id.eq.${otherUserId})`,
      `and(sender_id.eq.${otherUserId},receiver_id.eq.${authUser})`,
    ].join(",");

    const { data, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .or(filter)
      .order("created_at", { ascending: true });

    if (error) {
      const res = NextResponse.json(
        { message: "Error fetching messages", error: error.message },
        { status: 500 }
      );
      return addCorsHeaders(request, res);
    }

    return addCorsHeaders(request, NextResponse.json(data, { status: 200 }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const res = NextResponse.json({ message }, { status: 500 });
    return addCorsHeaders(request, res);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const message_id = (await params).id;

  if (!message_id) {
    const res = NextResponse.json(
      { message: "Missing message_id" },
      { status: 400 }
    );
    return addCorsHeaders(request, res);
  }

  try {
    const { error } = await supabaseAdmin
      .from("messages")
      .delete()
      .eq("id", message_id);

    if (error) {
      const res = NextResponse.json(
        { message: "Error deleting message", error: error.message },
        { status: 500 }
      );
      return addCorsHeaders(request, res);
    }

    const res = NextResponse.json(
      { message: "Message deleted" },
      { status: 200 }
    );
    return addCorsHeaders(request, res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const res = NextResponse.json({ message }, { status: 500 });
    return addCorsHeaders(request, res);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const message_id = (await params).id;
  const { text } = await request.json();

  if (!message_id || !text) {
    const res = NextResponse.json(
      { message: "Missing message_id or text" },
      { status: 400 }
    );
    return addCorsHeaders(request, res);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("messages")
      .update({ text, updated_at: new Date().toISOString() })
      .eq("id", message_id)
      .select()
      .single();

    if (error) {
      const res = NextResponse.json(
        { message: "Error updating message", error: error.message },
        { status: 500 }
      );
      return addCorsHeaders(request, res);
    }

    const res = NextResponse.json(data, { status: 200 });
    return addCorsHeaders(request, res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const res = NextResponse.json({ message }, { status: 500 });
    return addCorsHeaders(request, res);
  }
}
