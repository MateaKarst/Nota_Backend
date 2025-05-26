// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
    console.log("⚡ POST /api/auth/register called");

    const {
        email,
        password,
        first_name,
        last_name,
        avatar,
        profile_description,
    } = await req.json();

    console.log("📩 Received data:", {
        email,
        first_name,
        last_name,
        profile_description,
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json({ message: "Invalid email format." }, { status: 400 });
    }

    //  Create user in Supabase Auth
    console.log("🛠️ Creating user in Supabase Auth...");
    const { data: userAuth, error: errorAuth } = await supabaseAdmin.auth.signUp({
        email,
        password,
    });

    if (errorAuth || !userAuth.user?.id) {
        console.error("❌ Error creating auth user:", errorAuth?.message);
        return NextResponse.json(
            { message: "Failed to create auth user", error: errorAuth?.message },
            { status: 400 }
        );
    }

    const userId = userAuth.user.id;
    console.log("✅ Auth user created with ID:", userId);

    //  Try uploading avatar (optional)
    let avatar_url = null;
    try {
        if (avatar) {
            console.log("🖼️ Uploading avatar image to Supabase Storage...");

            const base64Data = avatar.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");

            const filePath = `avatars/${userId}-${Date.now()}.png`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from("avatars") // ⚠️ Make sure bucket is named "avatars"
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
        // Roll back auth user
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return NextResponse.json(
            { message: "Failed to upload avatar. User deleted to maintain integrity." },
            { status: 500 }
        );
    }

    // ✅ 3. Insert into user_details
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
        // Roll back auth user
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return NextResponse.json(
            { message: "Failed to insert user details. Auth user deleted.", error: insertError.message },
            { status: 500 }
        );
    }

    console.log("✅ User profile inserted successfully");

    return NextResponse.json(
        {
            message: "User successfully created",
            user_id: userId,
            avatar_url,
        },
        { status: 200 }
    );
}
