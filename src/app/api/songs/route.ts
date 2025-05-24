// src\app\api\songs\route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addCorsHeaders } from "@/utils/cors";

export async function POST(req: Request) {
    const body = await req.json();
    const { id, title, user_id, description, cover_image, compiled_path, genres } = body;

    if (!title || !user_id) {
        return addCorsHeaders(
            NextResponse.json({ message: "Missing title or user_id" }, { status: 400 })
        );
    }

    if (genres && !Array.isArray(genres)) {
        return addCorsHeaders(
            NextResponse.json({ message: "Genres must be an array" }, { status: 400 })
        );
    }

    const values = { title, user_id, description, cover_image, compiled_path, genres };

    const { data, error } = id
        ? await supabaseAdmin
            .from("songs")
            .update(values)
            .eq("id", id)
            .select()
            .single()
        : await supabaseAdmin
            .from("songs")
            .insert([values])
            .select()
            .single();

    if (error) {
        return addCorsHeaders(
            NextResponse.json({ message: "Error saving song", error: error.message }, { status: 500 })
        );
    }

    return addCorsHeaders(
        NextResponse.json(data, { status: 200 })
    );
}

export async function GET() {
    const { data, error } = await supabaseAdmin.from("songs").select("*");

    if (error) {
        return addCorsHeaders(
            NextResponse.json({ message: "Error fetching songs", error: error.message }, { status: 500 })
        );
    }

    return addCorsHeaders(
        NextResponse.json(data, { status: 200 })
    );
}