import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addCorsHeaders, handlePreflight } from "@/utils/cors";

export async function OPTIONS(request: NextRequest) {
    return handlePreflight(request);
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user_id = (await params).id;

    if (!user_id) {
        const res = NextResponse.json({ message: "Missing user ID" }, { status: 400 });
        return addCorsHeaders(request, res);
    }

    try {
        // 1. Get user info from Supabase Admin API
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user_id);

        if (authError) {
            console.error("Error fetching auth user:", authError);
            const res = NextResponse.json({ message: "Error fetching auth user", error: authError.message }, { status: 500 });
            return addCorsHeaders(request, res);
        }

        if (!authUser) {
            const res = NextResponse.json({ message: "Auth user not found" }, { status: 404 });
            return addCorsHeaders(request, res);
        }

        // 2. Get user details from user_details table
        const { data: userDetails, error: detailsError } = await supabaseAdmin
            .from("user_details")
            .select("*")
            .eq("id", user_id)
            .single();

        if (detailsError) {
            console.error("Error fetching user details:", detailsError);
            const res = NextResponse.json({ message: "Error fetching user details", error: detailsError.message }, { status: 500 });
            return addCorsHeaders(request, res);
        }

        // 3. Combine the results
        const combinedUser = {
            user: { ...authUser },
            user_details: { ...userDetails },
        };

        const res = NextResponse.json(combinedUser, { status: 200 });
        return addCorsHeaders(request, res);

    } catch (err) {
        console.error("Unexpected error:", err);
        const res = NextResponse.json({ message: "Unexpected error" }, { status: 500 });
        return addCorsHeaders(request, res);
    }
}
