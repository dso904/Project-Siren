import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // ============================================
    // ENVIRONMENT DETECTION - CRITICAL FOR VERCEL
    // ============================================
    // This middleware should ONLY run in local exhibition mode.
    // On Vercel (production), we skip all redirect logic.

    const isVercel = process.env.VERCEL === '1';
    const isProduction = process.env.NODE_ENV === 'production' && isVercel;

    // If we're on Vercel/Production, do nothing - let the app run normally
    if (isVercel || isProduction) {
        return NextResponse.next();
    }

    // ============================================
    // EXHIBITION MODE ONLY (Local Network)
    // ============================================
    // CONFIGURATION
    // The official IP of the station running the exhibition
    const TARGET_IP = '192.168.0.50';
    const TARGET_HOST = '192.168.0.50';

    // Get the host header from the request (e.g. "google.com" or "192.168.0.50")
    const host = request.headers.get('host') || '';

    // Clean the host to remove port numbers if present (e.g. "192.168.0.50:80")
    const hostname = host.split(':')[0];

    // ALLOW LIST
    // We allow requests that are already targeting our IP or localhost
    const allowedHosts = [TARGET_IP, 'localhost', '127.0.0.1'];

    // NETWORK ENGINEER NOTE: 
    // If the user requests "connectivitycheck.gstatic.com" or "captive.apple.com",
    // they are checking for internet. By redirecting them to our IP, we are saying
    // "Hey, look over here instead". The OS will see this redirect (307) and 
    // correctly interpret it as a captive portal login page.

    if (!allowedHosts.includes(hostname)) {
        // Determine the destination URL
        const url = request.nextUrl.clone();
        url.hostname = TARGET_HOST;
        url.port = '80'; // Ensure we're targeting standard HTTP port
        url.protocol = 'http:'; // Force HTTP, as we likely don't have valid certs for random domains

        // We redirect to the root (/) to ensure they hit the main landing/hack experience
        // or we can preserve the path. For a captive portal, resetting to root is safer
        // to ensure they see the "Login" (Simulation) page.
        url.pathname = '/';

        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// OPTIMIZATION:
// Only run on main requests, exclude static files to save resources
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Glitch.gif (public assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|Glitch.gif).*)',
    ],
};
