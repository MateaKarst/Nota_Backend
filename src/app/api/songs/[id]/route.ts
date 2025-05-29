// src/app/api/songs/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addCorsHeaders, handlePreflight } from "@/utils/cors";

export async function OPTIONS(request: NextRequest) {
    return handlePreflight(request);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const songId = (await params).id;

    // First delete tracks associated with the song
    const { error: tracksDeleteError } = await supabaseAdmin
        .from("tracks")
        .delete()
        .eq("song_id", songId);

    if (tracksDeleteError) {
        const res = NextResponse.json(
            { message: "Error deleting tracks", error: tracksDeleteError.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res); // ✅ Fix: pass request here
    }

    // Then delete the song
    const { error: songDeleteError } = await supabaseAdmin
        .from("songs")
        .delete()
        .eq("id", songId);

    if (songDeleteError) {
        const res = NextResponse.json(
            { message: "Error deleting song", error: songDeleteError.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res); // ✅ Fix: pass request here
    }

    const res = NextResponse.json(
        { message: "Song and its tracks deleted" },
        { status: 200 }
    );
    return addCorsHeaders(request, res); // ✅ Fix: pass request here
}


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
        const res = NextResponse.json(
            { message: "Error fetching song", error: songError.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
    }

    const { data: tracks, error: tracksError } = await supabaseAdmin
        .from("tracks")
        .select("*")
        .eq("song_id", songId);

    if (tracksError) {
        const res = NextResponse.json(
            { message: "Error fetching tracks", error: tracksError.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
    }

    const res = NextResponse.json({ ...song, tracks }, { status: 200 });
    return addCorsHeaders(request, res);
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

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        const body = await request.json();
        updateData = body;
    } else if (contentType.includes("multipart/form-data")) {
        const form = await request.formData();
        const file = form.get("file") as File | null;
        if (file) {
            const filename = `${crypto.randomUUID()}-${file.name}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from("songs")
                .upload(filename, file, { contentType: file.type, upsert: true });

            if (uploadError) {
                const res = NextResponse.json(
                    { message: "File upload error", error: uploadError.message },
                    { status: 500 }
                );
                return addCorsHeaders(request, res);
            }

            const publicUrlData = supabaseAdmin.storage.from("songs").getPublicUrl(filename);
            const publicUrl = publicUrlData.data.publicUrl;
            updateData.compiled_path = publicUrl;
        }

        const fields: (keyof SongUpdateData)[] = ["title", "description", "cover_image"];
        fields.forEach((key) => {
            const val = form.get(key);
            if (typeof val === "string") {
                updateData[key] = val;
            }
        });
    }

    if (Object.keys(updateData).length === 0) {
        const res = NextResponse.json({ message: "No data provided for update" }, { status: 400 });
        return addCorsHeaders(request, res);
    }

    const { data, error: updateError } = await supabaseAdmin
        .from("songs")
        .update(updateData)
        .eq("id", songId)
        .select()
        .single();

    if (updateError) {
        const res = NextResponse.json(
            { message: "Error updating song", error: updateError.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
    }

    const res = NextResponse.json({ message: "Song updated", data }, { status: 200 });
    return addCorsHeaders(request, res);
}
