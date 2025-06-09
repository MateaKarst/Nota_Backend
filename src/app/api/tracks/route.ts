// src/app/api/tracks/route.ts

import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { Instrument } from "@/utils/interfaceTypes";
import { parseBuffer } from "music-metadata";
import { addCorsHeaders, handlePreflight } from "@/utils/cors";

function parseFloatOrNull(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const num = parseFloat(value.toString());
  return isNaN(num) ? null : num;
}

function parseJSONOrNull<T>(value: FormDataEntryValue | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value.toString());
  } catch {
    return null;
  }
}

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  const form = await request.formData();

  const file = form.get("file") as File | null;
  const song_id = form.get("song_id")?.toString();

  const user_id = form.get("user_id")?.toString();
  if (!user_id) {
    const res = NextResponse.json({ message: "Missing user_id" }, { status: 400 });
    return addCorsHeaders(request, res);
  }

  if (!file || !song_id) {
    const res = NextResponse.json({ message: "Missing file or song_id" }, { status: 400 });
    return addCorsHeaders(request, res);
  }

  const filename = `${crypto.randomUUID()}-${file.name.toLowerCase()}`;
  const fileName = file.name.toLowerCase();
  const mimeType = file.type;

  if (!["audio/mpeg"].includes(mimeType) || !fileName.endsWith(".mp3")) {
    const res = NextResponse.json({ message: "Only MP3 files are allowed" }, { status: 400 });
    return addCorsHeaders(request, res);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const metadata = await parseBuffer(buffer, file.type);
    const duration = metadata.format.duration ?? 0;

    if (duration < 5) {
      const res = NextResponse.json({ message: "Track must be at least 5 seconds long" }, { status: 400 });
      return addCorsHeaders(request, res);
    }

    if (duration > 300) {
      const res = NextResponse.json({ message: "Track must be less than 5 minutes long" }, { status: 400 });
      return addCorsHeaders(request, res);
    }
  } catch (err) {
    const res = NextResponse.json(
      {
        message: "Failed to read audio metadata",
        error: (err as Error).message,
      },
      { status: 400 }
    );
    return addCorsHeaders(request, res);
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_FILE_SIZE) {
    const res = NextResponse.json({ message: "File is too large. Maximum size is 10MB." }, { status: 400 });
    return addCorsHeaders(request, res);
  }

  const { error: uploadError } = await supabaseAdmin.storage
    .from("tracks")
    .upload(filename, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    const res = NextResponse.json({ message: "Error uploading file", error: uploadError.message }, { status: 500 });
    return addCorsHeaders(request, res);
  }

  const publicUrl = supabaseAdmin.storage.from("tracks").getPublicUrl(filename).data.publicUrl;

  let instruments: Instrument[] | null = null;
  const instrumentsRaw = form.get("instruments");
  if (instrumentsRaw) {
    try {
      const parsed = JSON.parse(instrumentsRaw.toString());
      if (Array.isArray(parsed)) instruments = parsed;
      else {
        const res = NextResponse.json({ message: "Invalid instruments array" }, { status: 400 });
        return addCorsHeaders(request, res);
      }
    } catch {
      const res = NextResponse.json({ message: "Invalid instruments JSON" }, { status: 400 });
      return addCorsHeaders(request, res);
    }
  }

  const trackData = {
    song_id,
    user_id,
    url: publicUrl,
    storage_path: filename,
    start_position: parseFloatOrNull(form.get("start_position")) ?? 0,
    start_cue: parseFloatOrNull(form.get("start_cue")),
    end_cue: parseFloatOrNull(form.get("end_cue")),
    fade_in_end: parseFloatOrNull(form.get("fade_in_end")),
    fade_out_start: parseFloatOrNull(form.get("fade_out_start")),
    volume: parseFloatOrNull(form.get("volume")) ?? 1.0,
    draggable: form.get("draggable")?.toString() === "false" ? false : true,
    envelope: parseJSONOrNull(form.get("envelope")),
    intro: parseJSONOrNull(form.get("intro")),
    markers: parseJSONOrNull(form.get("markers")),
    wave_color: form.get("wave_color")?.toString() || "#2D2D2D",
    progress_color: form.get("progress_color")?.toString() || "#7C7C7C",
    instruments,
  };

  const { data: track, error } = await supabaseAdmin
    .from("tracks")
    .insert([trackData])
    .select()
    .single();

  if (error) {
    const res = NextResponse.json({ message: "Error saving track", error: error.message }, { status: 500 });
    return addCorsHeaders(request, res);
  }

  // Fetch the related song
  const { data: song, error: songError } = await supabaseAdmin
    .from("songs")
    .select("*")
    .eq("id", song_id)
    .single();

  if (songError) {
    const res = NextResponse.json(
      {
        message: "Track created, but failed to fetch song",
        track,
        error: songError.message,
      },
      { status: 207 }
    );
    return addCorsHeaders(request, res);
  }

  const res = NextResponse.json({ message: "Track created", track, song }, { status: 200 });
  return addCorsHeaders(request, res);
}
