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

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const songId = (await params).id
    const form = await request.formData();

    const file = form.get("file") as File | null;

    if (!file) {
        return addCorsHeaders(
            NextResponse.json({ message: "Missing file" }, { status: 400 })
        );
    }

    const filename = `${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabaseAdmin.storage
        .from("songs")
        .upload(filename, file, {
            contentType: file.type,
            upsert: true,
        });

    if (uploadError) {
        return addCorsHeaders(
            NextResponse.json(
                { message: "Error uploading file", error: uploadError.message },
                { status: 500 }
            )
        );
    }

    const publicUrlData = supabaseAdmin.storage
        .from("songs")
        .getPublicUrl(filename);

    const publicUrl = publicUrlData.data.publicUrl;

    if (!publicUrl) {
        return addCorsHeaders(
            NextResponse.json({ message: "Error getting public URL" }, { status: 500 })
        );
    }

    const { data, error: updateError } = await supabaseAdmin
        .from("songs")
        .update({ compiled_path: publicUrl })
        .eq("id", songId)
        .select()
        .single();

    if (updateError) {
        return addCorsHeaders(
            NextResponse.json(
                {
                    message: "Error updating song compiled_path",
                    error: updateError.message,
                },
                { status: 500 }
            )
        );
    }

    return addCorsHeaders(
        NextResponse.json(
            { message: "Compiled MP3 uploaded and song updated", data },
            { status: 200 }
        )
    );
}