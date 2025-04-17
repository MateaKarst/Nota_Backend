// src/app/api/auth/logout/route.ts
import { logoutHandler } from "@/routes/handlers/auth/logoutHandler";

export async function POST() {
    return logoutHandler();
}
