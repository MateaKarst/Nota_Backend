// src/app/api/songs/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addCorsHeaders } from "@/utils/cors";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const songId = (await params).id;

    const { data: song, error: songError } = await supabaseAdmin
        .from("songs")
        .select("*")
        .eq("id", songId)
        .single();

    if (songError) {
        return NextResponse.json(
            { message: "Error fetching song", error: songError.message },
            { status: 500 }
        );
    }

    const { data: tracks, error: tracksError } = await supabaseAdmin
        .from("tracks")
        .select("*")
        .eq("song_id", songId);

    if (tracksError) {
        return addCorsHeaders(
            NextResponse.json(
                { message: "Error fetching tracks", error: tracksError.message },
                { status: 500 }
            )
        );
    }

    return addCorsHeaders(
        NextResponse.json({ ...song, tracks }, { status: 200 })
    );
}

type SongUpdateData = {
    title?: string;
    description?: string;
    cover_image?: string;
    compiled_path?: string;
};

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const songId = (await params).id;

    let updateData: SongUpdateData = {};

    // Detect if it's formData or JSON
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        const body = await request.json();
        updateData = body; // Expects { title, description, cover_image, ... }
    } else if (contentType.includes("multipart/form-data")) {
        const form = await request.formData();
        const file = form.get("file") as File | null;
        if (file) {
            const filename = `${crypto.randomUUID()}-${file.name}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from("songs")
                .upload(filename, file, { contentType: file.type, upsert: true });

            if (uploadError) {
                return addCorsHeaders(
                    NextResponse.json({ message: "File upload error", error: uploadError.message }, { status: 500 })
                );
            }

            const publicUrlData = supabaseAdmin.storage.from("songs").getPublicUrl(filename);
            const publicUrl = publicUrlData.data.publicUrl;
            updateData.compiled_path = publicUrl;
        }

        // Optional other metadata fields
        const fields: (keyof SongUpdateData)[] = ["title", "description", "cover_image"];
        fields.forEach((key) => {
            const val = form.get(key);
            if (typeof val === "string") {
                updateData[key] = val;
            }
        });
    }

    if (Object.keys(updateData).length === 0) {
        return addCorsHeaders(
            NextResponse.json({ message: "No data provided for update" }, { status: 400 })
        );
    }

    const { data, error: updateError } = await supabaseAdmin
        .from("songs")
        .update(updateData)
        .eq("id", songId)
        .select()
        .single();

    if (updateError) {
        return addCorsHeaders(
            NextResponse.json({ message: "Error updating song", error: updateError.message }, { status: 500 })
        );
    }

    return addCorsHeaders(
        NextResponse.json({ message: "Song updated", data }, { status: 200 })
    );
}
