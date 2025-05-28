import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addCorsHeaders, handlePreflight } from "@/utils/cors";

export async function OPTIONS(request: Request) {
    return handlePreflight(request);
}

export async function POST(request: Request) {
    console.log("⚡ POST /api/auth/register called");

    const {
        email,
        password,
        first_name,
        last_name,
        avatar,
        profile_description,
    } = await request.json();

    console.log("📩 Received data:", {
        email,
        first_name,
        last_name,
        profile_description,
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const res = NextResponse.json({ message: "Invalid email format." }, { status: 400 });
        return addCorsHeaders(request, res);
    }

    console.log("🛠️ Creating user in Supabase Auth...");
    const { data: userAuth, error: errorAuth } = await supabaseAdmin.auth.signUp({
        email,
        password,
    });

    if (errorAuth || !userAuth.user?.id) {
        console.error("❌ Error creating auth user:", errorAuth?.message);
        const res = NextResponse.json(
            { message: "Failed to create auth user", error: errorAuth?.message },
            { status: 400 }
        );
        return addCorsHeaders(request, res);
    }

    const userId = userAuth.user.id;
    console.log("✅ Auth user created with ID:", userId);

    let avatar_url = null;
    try {
        if (avatar) {
            console.log("🖼️ Uploading avatar image to Supabase Storage...");

            const base64Data = avatar.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");
            const filePath = `avatars/${userId}-${Date.now()}.png`;

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
        }
    } catch (uploadError) {
        console.error("❌ Failed to upload avatar:", uploadError);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        const res = NextResponse.json(
            { message: "Failed to upload avatar. User deleted to maintain integrity." },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
    }

    const { error: insertError } = await supabaseAdmin.from("user_details").insert([
        {
            id: userId,
            email,
            first_name,
            last_name,
            avatar: avatar_url,
            profile_description,
        },
    ]);

    if (insertError) {
        console.error("❌ Error inserting into user_details:", insertError.message);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        const res = NextResponse.json(
            { message: "Failed to insert user details. Auth user deleted.", error: insertError.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
    }

    console.log("✅ User profile inserted successfully");
    const res = NextResponse.json(
        {
            message: "User successfully created",
            user_id: userId,
            avatar_url,
        },
        { status: 200 }
    );
    return addCorsHeaders(request, res);
}
