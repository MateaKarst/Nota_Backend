// // src/app/api/auth/register/route.ts
// import { NextResponse } from "next/server";
// import { supabaseAdmin } from "@/lib/supabase";

// export async function POST(req: Request) {
//     console.log("⚡ POST /api/auth/register called");

//     const { email, password, first_name, last_name, avatar, profile_description } = await req.json();
//     console.log("📩 Received data:", { email, first_name, last_name, profile_description });

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//         console.warn("❌ Invalid email format");
//         return NextResponse.json(
//             { message: "Invalid email format." },
//             { status: 400 }
//         );
//     }

//     // ✅ 1. Create user in Supabase Auth
//     console.log("🛠️ Creating user in Supabase Auth...");
//     const { data: userAuth, error: errorAuth } = await supabaseAdmin.auth.signUp({
//         email,
//         password,
//     });

//     if (errorAuth) {
//         console.error("❌ Error creating auth user:", errorAuth.message);
//         return NextResponse.json(
//             { message: "Failed to create auth user", error: errorAuth.message },
//             { status: 400 }
//         );
//     }

//     const userId = userAuth.user?.id;
//     if (!userId) {
//         console.error("❌ No user ID returned from Supabase Auth.");
//         return NextResponse.json({ message: "Missing user ID" }, { status: 500 });
//     }

//     console.log("✅ Auth user created with ID:", userId);

//     // ✅ 2. Upload avatar image to Supabase Storage
//     let avatar_url = null;
//     if (avatar) {
//         console.log("🖼️ Uploading avatar image to Supabase Storage...");
//         try {
//             // Assume avatar is a base64 string with data URI
//             const base64Data = avatar.split(",")[1]; // remove the "data:image/*;base64," part
//             const buffer = Buffer.from(base64Data, "base64");

//             const filePath = `avatars/${userId}-${Date.now()}.png`;

//             const { error: uploadError } = await supabaseAdmin.storage
//                 .from("avatar")
//                 .upload(filePath, buffer, {
//                     contentType: "image/png", // or detect from data URI if needed
//                     upsert: true,
//                 });

//             if (uploadError) {
//                 console.error("❌ Avatar upload failed:", uploadError.message);
//                 return NextResponse.json(
//                     { message: "Failed to upload avatar", error: uploadError.message },
//                     { status: 500 }
//                 );
//             }

//             // Get the public URL of the uploaded image
//             const { data: publicUrlData } = supabaseAdmin
//                 .storage
//                 .from("avatar")
//                 .getPublicUrl(filePath);

//             avatar_url = publicUrlData.publicUrl;
//             console.log("✅ Avatar uploaded successfully:", avatar_url);
//         } catch (err) {
//             console.error("❌ Unexpected error during avatar upload:", err);
//             return NextResponse.json(
//                 { message: "Unexpected error during avatar upload" },
//                 { status: 500 }
//             );
//         }
//     }

//     // ✅ 3. Insert user profile into public.user_details
//     console.log("📦 Inserting user profile into public.user_details...");
//     const { error: errorInsert } = await supabaseAdmin
//         .from("user_details")
//         .insert([{
//             id: userId,
//             email,
//             first_name,
//             last_name,
//             avatar: avatar_url,
//             profile_description
//         }]);

//     if (errorInsert) {
//         console.error("❌ Error inserting into public.user_details:", errorInsert.message);
//         return NextResponse.json(
//             { message: "Failed to insert user details", error: errorInsert.message },
//             { status: 400 }
//         );
//     }

//     console.log("✅ User profile successfully inserted");

//     return NextResponse.json(
//         {
//             message: "User successfully created",
//             user_id: userId,
//             avatar_url,
//         },
//         { status: 200 }
//     );
// }
