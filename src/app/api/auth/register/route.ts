// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
    console.log("⚡ POST /api/auth/register called");

    const { email, password, first_name, last_name, avatar, profile_description } = await req.json();
    console.log("📩 Received data:", { email, first_name, last_name, avatar, profile_description });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.warn("❌ Invalid email format");
        return NextResponse.json(
            { message: "Invalid email format." },
            { status: 400 }
        );
    }

    // ✅ 1. Create user in Supabase Auth
    console.log("🛠️ Creating user in Supabase Auth...");
    const { data: userAuth, error: errorAuth } = await supabaseAdmin.auth.signUp({
        email,
        password,
    });

    if (errorAuth) {
        console.error("❌ Error creating auth user:", errorAuth.message);
        return NextResponse.json(
            { message: "Failed to create auth user", error: errorAuth.message },
            { status: 400 }
        );
    }

    const userId = userAuth.user?.id;
    if (!userId) {
        console.error("❌ No user ID returned from Supabase Auth.");
        return NextResponse.json({ message: "Missing user ID" }, { status: 500 });
    }

    console.log("✅ Auth user created with ID:", userId);

    // ✅ 2. Insert extra info into public.users
    console.log("📦 Inserting user profile into public.users...");
    const { error: errorInsert } = await supabaseAdmin
        .from("user_details")
        .insert([{
            id: userId,
            email,
            first_name,
            last_name,
            avatar,
            profile_description
        }]);

    if (errorInsert) {
        console.error("❌ Error inserting into public.users:", errorInsert.message);
        return NextResponse.json(
            { message: "Failed to insert into public.users", error: errorInsert.message },
            { status: 400 }
        );
    }

    console.log("✅ User profile successfully inserted into public.users");

    return NextResponse.json(
        {
            message: "User successfully created",
            user_id: userId,
        },
        { status: 200 }
    );
}
