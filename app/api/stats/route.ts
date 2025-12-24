import { NextResponse } from "next/server";
import { getStats } from "@/lib/sessions";

/**
 * GET /api/stats
 * Returns current session statistics
 */
export async function GET() {
    const stats = getStats();

    return NextResponse.json({
        count: stats.count,
        deviceBreakdown: stats.deviceBreakdown,
        recentVictims: stats.victims.slice(-20).reverse(),
    });
}
