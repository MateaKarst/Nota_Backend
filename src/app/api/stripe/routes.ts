// import { NextRequest, NextResponse } from "next/server";
// import { addCorsHeaders, handlePreflight } from "@/utils/cors";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//     apiVersion: "2023-10-16", // Use your desired Stripe API version
// });

// export async function OPTIONS(request: NextRequest) {
//     return handlePreflight(request);
// }

// export async function POST(request: NextRequest) {
//     try {
//         const body = await request.json();
//         const { plan } = body;

//         if (!plan || !plan.name || !plan.price) {
//             const res = NextResponse.json(
//                 { message: "Missing plan name or price" },
//                 { status: 400 }
//             );
//             return addCorsHeaders(request, res);
//         }

//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             mode: "payment",
//             line_items: [
//                 {
//                     price_data: {
//                         currency: "usd",
//                         product_data: {
//                             name: plan.name,
//                         },
//                         unit_amount: parseInt(plan.price.replace("$", "")) * 100,
//                     },
//                     quantity: 1,
//                 },
//             ],
//             success_url: "http://localhost:3000/success",
//             cancel_url: "http://localhost:3000/cancel",
//         });

//         const res = NextResponse.json({ id: session.id }, { status: 200 });
//         return addCorsHeaders(request, res);

//     } catch (error: unknown) {
//         const message =
//             error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";

//         console.error("Stripe session creation error:", message);
//         const res = NextResponse.json(
//             { message: "Failed to create Stripe session", error: message },
//             { status: 500 }
//         );
//         return addCorsHeaders(request, res);
//     }
// }
