module.exports = {

"[project]/.next-internal/server/app/api/auth/me/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/stream [external] (stream, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[externals]/http [external] (http, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}}),
"[externals]/url [external] (url, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}}),
"[externals]/punycode [external] (punycode, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}}),
"[externals]/https [external] (https, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}}),
"[externals]/zlib [external] (zlib, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/utils/cors.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/utils/cors.ts
__turbopack_context__.s({
    "addCorsHeaders": (()=>addCorsHeaders),
    "handlePreflight": (()=>handlePreflight)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const allowedOrigins = [
    // localhost browser
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    // vio n mk network?
    'http://192.168.1.38:3000',
    'http://192.168.1.38:3001',
    'http://192.168.1.38:3002',
    // app sites
    'https://nota-community.netlify.app',
    'https://nota-backend-delta.vercel.app'
];
function handlePreflight(request) {
    const origin = request.headers.get('origin') || '';
    const headers = {
        'Access-Control-Allow-Methods': 'GET, PATCH, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-refresh-token, x-user-id',
        'Access-Control-Allow-Credentials': 'true'
    };
    if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    }
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](null, {
        status: 204,
        headers
    });
}
function addCorsHeaders(request, response) {
    const origin = request.headers.get('origin') || '';
    if (allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    return response;
}
}}),
"[project]/src/app/api/auth/me/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/app/api/me/route.ts
__turbopack_context__.s({
    "GET": (()=>GET),
    "OPTIONS": (()=>OPTIONS)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/cors.ts [app-route] (ecmascript)");
;
;
;
;
// const isProduction = process.env.NODE_ENV === "production";
const isProduction = false;
async function OPTIONS(request) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handlePreflight"])(request);
}
async function GET(request) {
    // 1. Try to get tokens from cookies
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    let access_token = cookieStore.get('access_token')?.value;
    let refresh_token = cookieStore.get('refresh_token')?.value;
    // 2. If no tokens in cookies, try to get from headers
    if (!access_token || !refresh_token) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            access_token = authHeader.substring('Bearer '.length);
        }
        const refreshHeader = request.headers.get('x-refresh-token');
        if (refreshHeader) {
            refresh_token = refreshHeader;
        }
    }
    // If still no tokens, return user null (allow no token request)
    if (!access_token || !refresh_token) {
        // This allows /me without token (e.g. admin panel) returning null user
        const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            user: null
        }, {
            status: 200
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addCorsHeaders"])(request, res);
    }
    // Create Supabase client
    let supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://aroapnbzmisuogwetsgm.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FwbmJ6bWlzdW9nd2V0c2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzQyNDUsImV4cCI6MjA2MjgxMDI0NX0.7ck6W63Ymuw39J97-voLoY1YCbWP_bsrGijCfkqGp9Q"), {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    });
    // Try to get user with access token
    const { data: { user }, error } = await supabase.auth.getUser(access_token);
    // If token invalid or no user, try refresh
    if (error || !user) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
            refresh_token
        });
        if (refreshError || !refreshData.session) {
            // Refresh failed, return user null (or 401 if you want strict)
            const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                user: null
            }, {
                status: 200
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addCorsHeaders"])(request, res);
        }
        const newAccessToken = refreshData.session.access_token;
        const newRefreshToken = refreshData.session.refresh_token;
        // Recreate supabase client with new access token
        supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://aroapnbzmisuogwetsgm.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FwbmJ6bWlzdW9nd2V0c2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzQyNDUsImV4cCI6MjA2MjgxMDI0NX0.7ck6W63Ymuw39J97-voLoY1YCbWP_bsrGijCfkqGp9Q"), {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
        const { data: { user: refreshedUser }, error: userError } = await supabase.auth.getUser(newAccessToken);
        if (userError || !refreshedUser) {
            const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                user: null
            }, {
                status: 200
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addCorsHeaders"])(request, res);
        }
        // Set refreshed tokens as httpOnly cookies (always)
        const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            user: {
                email: refreshedUser.email,
                name: refreshedUser.user_metadata?.full_name || ''
            }
        });
        res.cookies.set('access_token', newAccessToken, {
            httpOnly: true,
            sameSite: ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : 'lax',
            secure: isProduction,
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        });
        res.cookies.set('refresh_token', newRefreshToken, {
            httpOnly: true,
            sameSite: ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : 'lax',
            secure: isProduction,
            path: '/',
            maxAge: 60 * 60 * 24 * 30
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addCorsHeaders"])(request, res);
    }
    // User valid on first try, return user info
    const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        user: {
            id: user?.id,
            email: user.email,
            name: user.user_metadata?.full_name || '',
            access_token: access_token,
            refresh_token: refresh_token
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addCorsHeaders"])(request, res);
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__fb005ca3._.js.map