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

    // first delete tracks associated with the song
    const { error: tracksDeleteError } = await supabaseAdmin
        .from("tracks")
        .delete()
        .eq("song_id", songId);

    if (tracksDeleteError) {
        const res = NextResponse.json(
            { message: "Error deleting tracks", error: tracksDeleteError.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
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
        return addCorsHeaders(request, res);
    }

    const res = NextResponse.json(
        { message: "Song and its tracks deleted" },
        { status: 200 }
    );
    return addCorsHeaders(request, res);
}


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const songId = (await params).id;
    // 1. Fetch the song
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

    // 2. Fetch tracks for the song
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

    // 3. Get unique user_ids from tracks
    const trackUserIds = [...new Set(tracks.map((track) => track.user_id).filter(Boolean))];

    // 4. Fetch user_details for those user_ids
    let trackUsersDetails = [];
    if (trackUserIds.length > 0) {
        const { data, error } = await supabaseAdmin
            .from("user_details")
            .select("*")
            .in("id", trackUserIds);  // assuming 'id' is the correct field

        if (error) {
            const res = NextResponse.json(
                { message: "Error fetching track user details", error: error.message },
                { status: 500 }
            );
            return addCorsHeaders(request, res);
        }

        trackUsersDetails = data || [];
    }

    // 5. Map user_details to each track
    const trackUserMap = new Map(trackUsersDetails.map((u) => [u.id, u]));
    const enrichedTracks = tracks.map((track) => ({
        ...track,
        user_details: trackUserMap.get(track.user_id) || null,
    }));

    // 6. Return song with enriched tracks
    const res = NextResponse.json({ ...song, tracks: enrichedTracks }, { status: 200 });
    return addCorsHeaders(request, res);
}

type SongUpdateData = {
    title?: string;
    description?: string;
    cover_image?: string;
    compiled_path?: string;
    genres?: string[];
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
        const file = form.get("cover_image") as File | null;
        if (file) {
            const filename = `${crypto.randomUUID()}-${file.name}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from("songs")
                .upload(filename, file, {
                    contentType: file.type,
                    upsert: true,
                });

            if (uploadError) {
                const res = NextResponse.json(
                    { message: "File upload error", error: uploadError.message },
                    { status: 500 }
                );
                return addCorsHeaders(request, res);
            }

            const { data: publicUrlData } = supabaseAdmin.storage.from("songs").getPublicUrl(filename);
            updateData.cover_image = publicUrlData.publicUrl;
        }

        const fields: (keyof SongUpdateData)[] = ["title", "description", "cover_image", "genres"];
        fields.forEach((key) => {
            const val = form.get(key);
            if (typeof val === "string") {
                if (key === "genres") {
                    try {
                        const parsed = JSON.parse(val);
                        if (Array.isArray(parsed) && parsed.every((g) => typeof g === "string")) {
                            const VALID_GENRES = ['rock', 'pop', 'jazz', 'classical', 'hiphop', 'electronic', 'country', 'other'];
                            updateData.genres = parsed.filter((g) => VALID_GENRES.includes(g));
                        }
                    } catch {
                        console.warn("Invalid genres JSON string");
                    }
                } else {
                    updateData[key] = val;
                }
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
