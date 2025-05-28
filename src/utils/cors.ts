// src/utils/cors.ts
import { NextResponse } from 'next/server'

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://192.168.1.38:3000',
    'http://192.168.1.38:3001',
    'https://nota-community.netlify.app'
]

export function handlePreflight(request: Request): NextResponse {
    const origin = request.headers.get('origin') || ''
    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, PATCH, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    }

    if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin
    }

    return new NextResponse(null, {
        status: 204,
        headers,
    })
}

export function addCorsHeaders(
    request: Request,
    response: NextResponse
): NextResponse {
    const origin = request.headers.get('origin') || ''
    if (allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    return response
}
