// src/app/api/connections/route.ts
import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addCorsHeaders, handlePreflight } from "@/utils/cors";

export async function OPTIONS(request: NextRequest) {
    return handlePreflight(request);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user_id = (await params).id;
    const body = await request.json();
    const { id, connection_id } = body;

    if (!connection_id || !user_id) {
        const res = NextResponse.json(
            { message: "Missing connection_id or user_id" },
            { status: 400 }
        );
        return addCorsHeaders(request, res);
    }

    const values = { user_id, connection_id };

    const { data: existingConnection, error: existingError } = await supabaseAdmin
        .from("connections")
        .select("id")
        .eq("user_id", user_id)
        .eq("connection_id", connection_id)
        .maybeSingle();

    if (existingError) {
        const res = NextResponse.json(
            { message: "Error checking existing connection", error: existingError.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
    }

    if (existingConnection && !id) {
        const res = NextResponse.json({ message: "Connection already exists" }, { status: 409 });
        return addCorsHeaders(request, res);
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
        const res = NextResponse.json(
            { message: "Error saving connection", error: error.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
    }

    const res = NextResponse.json(data, { status: 200 });
    return addCorsHeaders(request, res);
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user_id = (await params).id;

    if (!user_id) {
        const res = NextResponse.json({ message: "Missing user_id" }, { status: 400 });
        return addCorsHeaders(request, res);
    }

    const { data, error } = await supabaseAdmin
        .from("connections")
        .select("*")
        .eq("user_id", user_id);

    if (error) {
        const res = NextResponse.json(
            { message: "Error fetching connections", error: error.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
    }

    const res = NextResponse.json(data, { status: 200 });
    return addCorsHeaders(request, res);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;

    if (!id) {
        const res = NextResponse.json({ message: "Missing connection id" }, { status: 400 });
        return addCorsHeaders(request, res);
    }

    // Check if connection exists first
    const { data: existingConnection, error: fetchError } = await supabaseAdmin
        .from("connections")
        .select("id")
        .eq("id", id)
        .single();

    if (fetchError) {
        const res = NextResponse.json(
            { message: "Error checking connection existence", error: fetchError.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
    }

    if (!existingConnection) {
        const res = NextResponse.json({ message: "Connection not found" }, { status: 404 });
        return addCorsHeaders(request, res);
    }

    // Proceed to delete
    const { error: deleteError } = await supabaseAdmin
        .from("connections")
        .delete()
        .eq("id", id);

    if (deleteError) {
        const res = NextResponse.json(
            { message: "Error deleting connection", error: deleteError.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
    }

    const res = NextResponse.json({ message: "Connection deleted successfully" }, { status: 200 });
    return addCorsHeaders(request, res);
}