// src/app/api/messages/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addCorsHeaders, handlePreflight } from "@/utils/cors";

export async function OPTIONS(request: NextRequest) {
    return handlePreflight(request);
}

export async function POST(request: NextRequest) {
    const sender_id = request.headers.get("x-user-id");

    const url = new URL(request.url);
    const receiver_id = url.pathname.split("/").pop(); // or use regex if your route is deeper

    if (!sender_id) {
        const res = NextResponse.json(
            { message: "Missing authenticated user ID in header" },
            { status: 401 }
        );
        return addCorsHeaders(request, res);
    }

    if (!receiver_id) {
        const res = NextResponse.json(
            { message: "Missing receiver user ID in URL" },
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
