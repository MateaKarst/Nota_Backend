// src/app/api/auth/register/route.ts
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
        name,
        avatar,
        profile_description,
    } = await request.json();

    console.log("📩 Received data:", {
        email,
        name,
        profile_description,
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const res = NextResponse.json({ message: "Invalid email format." }, { status: 400 });
        return addCorsHeaders(request, res);
    }

    console.log("🛠️ Creating user in Supabase Auth...");

    const { data: userAuth, error: errorAuth } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
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
            name,
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

    // Now, sign in the user to get session tokens
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError || !signInData.session) {
        console.error("❌ Failed to sign in new user:", signInError?.message);
        // Optionally delete user to rollback
        await supabaseAdmin.auth.admin.deleteUser(userId);
        const res = NextResponse.json(
            { message: "Failed to sign in new user", error: signInError?.message },
            { status: 500 }
        );
        return addCorsHeaders(request, res);
    }

    const accessToken = signInData.session.access_token;
    const refreshToken = signInData.session.refresh_token;

    const res = NextResponse.json(
        {
            message: "User successfully created and logged in",
            user: {
                id: userId,
                email,
                name,
                access_token: accessToken,
                refresh_token: refreshToken,
            },
        },
        { status: 200 }
    );

    // Set auth cookies
    res.cookies.set('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    res.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return addCorsHeaders(request, res);
}
