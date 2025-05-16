// src/utils/interfaceTypes.ts

// Enum values for genres (songs)
export type Genre =
    | "rock"
    | "pop"
    | "jazz"
    | "classical"
    | "hiphop"
    | "electronic"
    | "country";

// Enum values for instruments (tracks)
export type Instrument =
    | "guitar"
    | "bass"
    | "drums"
    | "keyboard"
    | "vocals"
    | "synthesizer"
    | "saxophone";

// Song interface
export interface Song {
    id?: string;
    title: string;
    user_id: string;
    description?: string | null;
    cover_image?: string | null;
    compiled_path?: string | null;
    genres?: Genre[]; // multiple genres
}

// Track interface
interface EnvelopePoint {
    time: number;
    volume: number;
}

interface Intro {
    endTime: number;
    label: string;
    color: string;
}

interface Marker {
    time: number;
    label: string;
    color: string;
}

export interface Track {
    id: string;
    song_id: string;
    url: string;
    storage_path: string;
    start_position?: number;
    start_cue?: number | null;
    end_cue?: number | null;
    fade_in_end?: number | null;
    fade_out_start?: number | null;
    volume?: number;
    draggable?: boolean;
    envelope?: EnvelopePoint[] | null;
    intro?: Intro | null;
    markers?: Marker[] | null;
    wave_color?: string | null;
    progress_color?: string | null;
    instruments?: Instrument[];
}