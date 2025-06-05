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

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user_id = (await params).id;

    if (!user_id) {
        const res = NextResponse.json({ message: "Missing user ID" }, { status: 400 });
        return addCorsHeaders(request, res);
    }

    try {
        const body = await request.json();
        const { name, avatar, profile_description } = body;

        if (!name && !avatar && !profile_description) {
            const res = NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
            return addCorsHeaders(request, res);
        }

        let avatar_url = null;
        // If avatar is provided as a base64 image string, upload it to Supabase Storage
        if (avatar) {
            try {
                console.log("🖼️ Uploading avatar image to Supabase Storage...");

                // Extract base64 data (strip prefix like "data:image/png;base64,...")
                const base64Data = avatar.split(",")[1];
                const buffer = Buffer.from(base64Data, "base64");
                const filePath = `avatars/${user_id}-${Date.now()}.png`;

                const { error: uploadError } = await supabaseAdmin.storage
                    .from("avatars")
                    .upload(filePath, buffer, {
                        contentType: "image/png",
                        upsert: true,
                    });

                if (uploadError) throw new Error(uploadError.message);

                const { data: publicUrlData } = supabaseAdmin.storage
                    .from("avatars")
                    .getPublicUrl(filePath);

                avatar_url = publicUrlData.publicUrl;
                console.log("✅ Avatar uploaded successfully:", avatar_url);

            } catch (uploadError) {
                console.error("❌ Failed to upload avatar:", uploadError);
                // Optionally delete the user here to maintain integrity if needed
                // await supabaseAdmin.auth.admin.deleteUser(user_id);
                const res = NextResponse.json(
                    { message: "Failed to upload avatar." },
                    { status: 500 }
                );
                return addCorsHeaders(request, res);
            }
        }

        const updateFields: { [key: string]: string | null | undefined } = {};
        if (name !== undefined) updateFields.name = name;
        if (profile_description !== undefined) updateFields.profile_description = profile_description;
        if (avatar_url) updateFields.avatar = avatar_url;  // store public URL, not base64 string

        console.log('Updating user details for:', user_id, updateFields);

        const { data, error } = await supabaseAdmin
            .from("user_details")
            .update(updateFields)
            .eq("id", user_id)
            .single();

        if (error) {
            console.error("Error updating user details:", error);
            const res = NextResponse.json({ message: "Error updating user details", error: error.message }, { status: 500 });
            return addCorsHeaders(request, res);
        }

        const res = NextResponse.json({ message: "User updated successfully", user_details: data }, { status: 200 });
        return addCorsHeaders(request, res);

    } catch (err) {
        console.error("Unexpected error:", err);
        const res = NextResponse.json({ message: "Unexpected error" }, { status: 500 });
        return addCorsHeaders(request, res);
    }
}
