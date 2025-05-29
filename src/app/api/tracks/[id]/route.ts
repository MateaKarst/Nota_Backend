// src/app/api/tracks/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { Track } from "@/utils/interfaceTypes";
import { addCorsHeaders } from "@/utils/cors";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const trackId = (await params).id;

    const { error: trackDeleteError } = await supabaseAdmin
        .from("tracks")
        .delete()
        .eq("id", trackId);

    if (trackDeleteError) {
        return addCorsHeaders(
            NextResponse.json(
                { message: "Error deleting track", error: trackDeleteError.message },
                { status: 500 }
            )
        );
    }

    return addCorsHeaders(
        NextResponse.json({ message: "Track deleted" }, { status: 200 })
    );
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const trackId = (await params).id;

    const { data: track, error: trackError } = await supabaseAdmin
        .from("tracks")
        .select("*")
        .eq("id", trackId)
        .single();

    if (trackError) {
        return addCorsHeaders(
            NextResponse.json(
                { message: "Error fetching track", error: trackError.message },
                { status: 500 }
            )
        );
    }

    const { data: song, error: songError } = await supabaseAdmin
        .from("songs")
        .select("*")
        .eq("id", track.song_id)
        .single();

    if (songError) {
        return addCorsHeaders(
            NextResponse.json(
                { message: "Error fetching song", error: songError.message },
                { status: 500 }
            )
        );
    }

    return addCorsHeaders(
        NextResponse.json({ track, song }, { status: 200 })
    );
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const trackId = (await params).id
    const body: Partial<Track> = await request.json();

    const allowedFields: (keyof Track)[] = [
        "url",
        "storage_path",
        "start_position",
        "start_cue",
        "end_cue",
        "fade_in_end",
        "fade_out_start",
        "volume",
        "draggable",
        "envelope",
        "intro",
        "markers",
        "wave_color",
        "progress_color",
        "instruments",
    ];

    const validInstruments = [
        "guitar",
        "bass",
        "drums",
        "keyboard",
        "vocals",
    ];

    const updateData: Partial<Track> = {};

    for (const key of allowedFields) {
        if (key in body) {
            const value = body[key];

            if (key === "instruments" && value !== undefined) {
                if (!Array.isArray(value)) {
                    return addCorsHeaders(
                        NextResponse.json({ message: "Instruments must be an array" }, { status: 400 })
                    );
                }

                const isValidInstrumentsArray = value.every(
                    (i) => typeof i === "string" && validInstruments.includes(i)
                );

                if (!isValidInstrumentsArray) {
                    return addCorsHeaders(
                        NextResponse.json({ message: "Invalid instruments array" }, { status: 400 })
                    );
                }
            }

            (updateData[key] as typeof value) = value;
        }
    }

    if (Object.keys(updateData).length === 0) {
        return addCorsHeaders(
            NextResponse.json({ message: "No valid fields provided for update" }, { status: 400 })
        );
    }

    const { data: updatedTrack, error: updateError } = await supabaseAdmin
        .from("tracks")
        .update(updateData)
        .eq("id", trackId)
        .select()
        .single();

    if (updateError) {
        return addCorsHeaders(
            NextResponse.json(
                { message: "Error updating track", error: updateError.message },
                { status: 500 }
            )
        );
    }

    const { data: song, error: songError } = await supabaseAdmin
        .from("songs")
        .select("*")
        .eq("id", updatedTrack.song_id)
        .single();

    if (songError) {
        return addCorsHeaders(
            NextResponse.json(
                {
                    message: "Track updated, but error fetching song",
                    track: updatedTrack,
                    error: songError.message,
                },
                { status: 207 }
            )
        );
    }

    return addCorsHeaders(
        NextResponse.json(
            { message: "Track updated", track: updatedTrack, song },
            { status: 200 }
        )
    );
}