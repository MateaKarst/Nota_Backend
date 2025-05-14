// // src/routes/handlers/auth/logoutHandler.ts
// import { NextResponse } from "next/server";

// /**
//  * Logs out the user and clears the sb-access-token cookie.
//  */
// export async function logoutHandler() {
//     const response = NextResponse.json({ message: 'Logged out successfully' });

//     response.cookies.set({
//         name: 'sb-access-token',
//         value: '',
//         path: '/',
//         maxAge: 0, // instantly expire
//     });

//     return response;
// }
