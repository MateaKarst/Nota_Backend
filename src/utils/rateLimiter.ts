// src/utils/rateLimiter.ts
const attempts: Record<string, { count: number; time: number }> = {};
const LIMIT = 5;
const WINDOW = 60 * 1000; // 1 min

export function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    if (!attempts[ip]) {
        attempts[ip] = { count: 1, time: now };
        return true;
    }

    const diff = now - attempts[ip].time;
    if (diff > WINDOW) {
        attempts[ip] = { count: 1, time: now };
        return true;
    }

    attempts[ip].count++;

    return attempts[ip].count <= LIMIT;
}
