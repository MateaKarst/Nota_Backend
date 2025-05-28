// src\app\api\songs\route.ts
import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addCorsHeaders, handlePreflight } from "@/utils/cors";

export async function OPTIONS(request: NextRequest) {
    return handlePreflight(request);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { id, title, user_id, description, cover_image, compiled_path, genres } = body;

    if (!title || !user_id) {
        const res = NextResponse.json({ message: "Missing title or user_id" }, { status: 400 });
        return addCorsHeaders(request, res);
    }

    if (genres && !Array.isArray(genres)) {
        const res = NextResponse.json({ message: "Genres must be an array" }, { status: 400 });
        return addCorsHeaders(request, res);
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
        const res = NextResponse.json({ message: "Error saving song", error: error.message }, { status: 500 });
        return addCorsHeaders(request, res);
    }

    const res = NextResponse.json(data, { status: 200 });
    return addCorsHeaders(request, res);
}

export async function GET(request: NextRequest) {
    const { data, error } = await supabaseAdmin.from("songs").select("*");

    if (error) {
        const res = NextResponse.json({ message: "Error fetching songs", error: error.message }, { status: 500 });
        return addCorsHeaders(request, res);
    }

    const res = NextResponse.json(data, { status: 200 });
    return addCorsHeaders(request, res);
}
