import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Song } from "@/utils/interfaceTypes";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const songId = params.id;
    const body = await req.json();

    const allowedFields: (keyof Song)[] = [
        "title",
        "description",
        "cover_image",
        "compiled_path",
        "genres",
    ];

    const updateData: Partial<Song> = {};

    for (const key of allowedFields) {
        if (key in body) {
            const value = body[key];

            if (key === "genres" && value !== undefined) {
                const isValidGenreArray =
                    Array.isArray(value) && value.every((g) =>
                        ["rock", "pop", "jazz", "classical", "hiphop", "electronic", "country"].includes(g)
                    );

                if (!isValidGenreArray) {
                    return NextResponse.json({ message: "Invalid genres array" }, { status: 400 });
                }
            } else if (typeof value !== "string" && value !== null && value !== undefined) {
                return NextResponse.json(
                    { message: `Invalid type for ${key}, expected string, null, or array (for genres)` },
                    { status: 400 }
                );
            }

            updateData[key] = value; 
        }
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: "No valid fields provided for update" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("songs")
        .update(updateData)
        .eq("id", songId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: "Error updating song", error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
}
