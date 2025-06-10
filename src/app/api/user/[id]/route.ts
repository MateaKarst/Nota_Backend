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
        // get user info from Supabase Admin API
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

        // get user details from user_details table
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

        // combine the results
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
    request: Request,
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

        if (avatar) {
            try {
                console.log("Uploading avatar image to Supabase Storage...");

                const base64Data = avatar.includes(",") ? avatar.split(",")[1] : avatar;
                const buffer = Buffer.from(base64Data, "base64");

                let contentType = "image/png";
                if (avatar.startsWith("data:image/x-icon")) contentType = "image/x-icon";
                else if (avatar.startsWith("data:image/jpeg")) contentType = "image/jpeg";
                else if (avatar.startsWith("data:image/gif")) contentType = "image/gif";

                const filePath = `avatars/${user_id}-${Date.now()}.png`;

                const { error: uploadError } = await supabaseAdmin.storage
                    .from("avatars")
                    .upload(filePath, buffer, {
                        contentType,
                        upsert: true,
                    });

                if (uploadError) throw new Error(typeof uploadError === "string" ? uploadError : JSON.stringify(uploadError));

                const { data: publicUrlData } = supabaseAdmin.storage
                    .from("avatars")
                    .getPublicUrl(filePath);

                avatar_url = publicUrlData.publicUrl;
                console.log("Avatar uploaded successfully:", avatar_url);

            } catch (uploadError: unknown) {
                // narrow error type to string message
                let message = "Unknown error";
                if (uploadError instanceof Error) message = uploadError.message;
                else if (typeof uploadError === "string") message = uploadError;

                console.error("Failed to upload avatar:", message);
                const res = NextResponse.json(
                    { message: "Failed to upload avatar.", error: message },
                    { status: 500 }
                );
                return addCorsHeaders(request, res);
            }
        }

        const updateFields: { [key: string]: string | null | undefined } = {};
        if (name !== undefined) updateFields.name = name;
        if (profile_description !== undefined) updateFields.profile_description = profile_description;
        if (avatar_url) updateFields.avatar = avatar_url;

        console.log("Updating user details for:", user_id, updateFields);

        const { data, error } = await supabaseAdmin
            .from("user_details")
            .update(updateFields)
            .eq("id", user_id)
            .single();

        if (error) {
            console.error("Error updating user details:", error.message ?? error);
            const res = NextResponse.json(
                { message: "Error updating user details", error: error.message ?? error },
                { status: 500 }
            );
            return addCorsHeaders(request, res);
        }

        const res = NextResponse.json(
            { message: "User updated successfully", user_details: data },
            { status: 200 }
        );
        return addCorsHeaders(request, res);

    } catch (err: unknown) {
        // Narrow err type here too
        let message = "Unknown error";
        if (err instanceof Error) message = err.message;
        else if (typeof err === "string") message = err;

        console.error("Unexpected error:", message);
        const res = NextResponse.json({ message: "Unexpected error", error: message }, { status: 500 });
        return addCorsHeaders(request, res);
    }
}

