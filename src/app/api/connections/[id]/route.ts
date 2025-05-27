// src/app/api/connections/route.ts
import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addCorsHeaders } from "@/utils/cors";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user_id = (await params).id;
    const body = await request.json();
    const { id, connection_id } = body;

    if (!connection_id || !user_id) {
        return addCorsHeaders(
            NextResponse.json({ message: "Missing connection_id or user_id" }, { status: 400 })
        );
    }

    const values = { user_id, connection_id };

    const { data: existingConnection, error: existingError } = await supabaseAdmin
        .from("connections")
        .select("id")
        .eq("user_id", user_id)
        .eq("connection_id", connection_id)
        .maybeSingle();

    if (existingError) {
        return addCorsHeaders(
            NextResponse.json({ message: `Error checking existing connection`, error: existingError.message }, { status: 500 })
        );
    }

    if (existingConnection && !id) {
        return addCorsHeaders(
            NextResponse.json({ message: "Connection already exists" }, { status: 409 })
        );
    }

    const { data, error } = id
        ? await supabaseAdmin
            .from("connections")
            .update(values)
            .eq("id", id)
            .select()
            .single()
        : await supabaseAdmin
            .from("connections")
            .insert([values])
            .select()
            .single();

    if (error) {
        return addCorsHeaders(
            NextResponse.json({ message: "Error saving connection", error: error.message }, { status: 500 })
        );
    }

    return addCorsHeaders(
        NextResponse.json(data, { status: 200 })
    );
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;

    if (!id) {
        return addCorsHeaders(
            NextResponse.json({ message: "Missing connection id" }, { status: 400 })
        );
    }

    // Check if connection exists first
    const { data: existingConnection, error: fetchError } = await supabaseAdmin
        .from("connections")
        .select("id")
        .eq("id", id)
        .single();

    if (fetchError) {
        return addCorsHeaders(
            NextResponse.json(
                { message: "Error checking connection existence", error: fetchError.message },
                { status: 500 }
            )
        );
    }

    if (!existingConnection) {
        return addCorsHeaders(
            NextResponse.json({ message: "Connection not found" }, { status: 404 })
        );
    }

    // Proceed to delete
    const { error: deleteError } = await supabaseAdmin
        .from("connections")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return addCorsHeaders(
            NextResponse.json(
                { message: "Error deleting connection", error: deleteError.message },
                { status: 500 }
            )
        );
    }

    return addCorsHeaders(
        NextResponse.json({ message: "Connection deleted successfully" }, { status: 200 })
    );
}
