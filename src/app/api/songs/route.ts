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
    // 1. Fetch all songs
    const { data: songs, error: songsError } = await supabaseAdmin
        .from("songs")
        .select("*");

    if (songsError) {
        const res = NextResponse.json(
            { message: "Error fetching songs", error: songsError.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
    }

    if (!songs || songs.length === 0) {
        const res = NextResponse.json([], { status: 200 });
        return addCorsHeaders(request, res);
    }

    // Get all unique user_ids from songs (remove falsy)
    const songUserIds = [...new Set(songs.map((song) => song.user_id).filter(Boolean))];

    // 2. Fetch user_details for these user_ids (skip if empty)
    let songUsersDetails = [];
    if (songUserIds.length > 0) {
        const { data, error } = await supabaseAdmin
            .from("user_details")
            .select("*")
            .in("id", songUserIds);  // <-- changed from auth_user_id to id

        if (error) {
            const res = NextResponse.json(
                { message: "Error fetching user details", error: error.message },
                { status: 500 }
            );
            return addCorsHeaders(request, res);
        }
        songUsersDetails = data || [];
    }

    // 3. Fetch tracks for these songs
    const songIds = songs.map((song) => song.id);
    let tracks = [];
    if (songIds.length > 0) {
        const { data, error } = await supabaseAdmin
            .from("tracks")
            .select("*")
            .in("song_id", songIds);

        if (error) {
            const res = NextResponse.json(
                { message: "Error fetching tracks", error: error.message },
                { status: 500 }
            );
            return addCorsHeaders(request, res);
        }
        tracks = data || [];
    }

    // 4. Get unique user_ids from tracks (remove falsy)
    const trackUserIds = [...new Set(tracks.map((track) => track.user_id).filter(Boolean))];

    // 5. Fetch user_details for track users (skip if empty)
    let trackUsersDetails = [];
    if (trackUserIds.length > 0) {
        const { data, error } = await supabaseAdmin
            .from("user_details")
            .select("*")
            .in("id", trackUserIds);  // <-- changed from auth_user_id to id

        if (error) {
            const res = NextResponse.json(
                { message: "Error fetching track user details", error: error.message },
                { status: 500 }
            );
            return addCorsHeaders(request, res);
        }
        trackUsersDetails = data || [];
    }

    // 6. Map user_details by id for easy lookup
    const songUserMap = new Map(songUsersDetails.map((u) => [u.id, u]));  // <-- changed key to id
    const trackUserMap = new Map(trackUsersDetails.map((u) => [u.id, u])); // <-- changed key to id

    // 7. Attach user_details to songs and tracks
    const songsWithUsers = songs.map((song) => ({
        ...song,
        user_details: songUserMap.get(song.user_id) || null,
        tracks: tracks
            .filter((track) => track.song_id === song.id)
            .map((track) => ({
                ...track,
                user_details: trackUserMap.get(track.user_id) || null,
            })),
    }));

    const res = NextResponse.json(songsWithUsers, { status: 200 });
    return addCorsHeaders(request, res);
}
