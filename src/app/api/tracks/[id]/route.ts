import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { Track } from "@/utils/interfaceTypes";

export async function GET(_: Request, { params }: { params: { id: string } }) {
    const trackId = params.id;

    // Fetch the track
    const { data: track, error: trackError } = await supabaseAdmin
        .from("tracks")
        .select("*")
        .eq("id", trackId)
        .single();

    if (trackError) {
        return NextResponse.json({ message: "Error fetching track", error: trackError.message }, { status: 500 });
    }

    // Fetch the parent song
    const { data: song, error: songError } = await supabaseAdmin
        .from("songs")
        .select("*")
        .eq("id", track.song_id)
        .single();

    if (songError) {
        return NextResponse.json({ message: "Error fetching song", error: songError.message }, { status: 500 });
    }

    return NextResponse.json({ track, song }, { status: 200 });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const id = params.id;
    const body: Partial<Track> = await req.json();

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
        "synthesizer",
        "saxophone",
    ];

    const updateData: Partial<Track> = {};

    for (const key of allowedFields) {
        if (key in body) {
            const value = body[key];

            // Validate instruments enum array if present
            if (key === "instruments" && value !== undefined) {
                // Narrow to unknown first
                if (!Array.isArray(value)) {
                    return NextResponse.json({ message: "Instruments must be an array" }, { status: 400 });
                }

                // Validate every item is a string and is in validInstruments
                const isValidInstrumentsArray = value.every(
                    (i) => typeof i === "string" && validInstruments.includes(i)
                );

                if (!isValidInstrumentsArray) {
                    return NextResponse.json({ message: "Invalid instruments array" }, { status: 400 });
                }
            }


            (updateData[key] as typeof value) = value;
        }
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: "No valid fields provided for update" }, { status: 400 });
    }

    // Update the track and return the updated record
    const { data: updatedTrack, error: updateError } = await supabaseAdmin
        .from("tracks")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json({ message: "Error updating track", error: updateError.message }, { status: 500 });
    }

    // Fetch the parent song after update
    const { data: song, error: songError } = await supabaseAdmin
        .from("songs")
        .select("*")
        .eq("id", updatedTrack.song_id)
        .single();

    if (songError) {
        return NextResponse.json({ message: "Track updated, but error fetching song", track: updatedTrack, error: songError.message }, { status: 207 });
    }

    return NextResponse.json({ message: "Track updated", track: updatedTrack, song }, { status: 200 });
}
