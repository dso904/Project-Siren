import { addClient, removeClient } from "@/lib/sessions";

/**
 * SSE (Server-Sent Events) endpoint for real-time updates
 * Admin dashboards connect here to receive live victim notifications
 */

/**
 * GET /api/events
 * SSE endpoint for real-time victim notifications
 */
export async function GET(): Promise<Response> {
    const stream = new ReadableStream({
        start(controller) {
            // Add this client to the shared set
            addClient(controller);

            // Send initial connection message
            const connectMessage = `data: ${JSON.stringify({ type: "connected" })}\n\n`;
            controller.enqueue(new TextEncoder().encode(connectMessage));

            // Heartbeat to keep connection alive
            const heartbeat = setInterval(() => {
                try {
                    const ping = `data: ${JSON.stringify({ type: "ping" })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(ping));
                } catch {
                    clearInterval(heartbeat);
                    removeClient(controller);
                }
            }, 30000); // Every 30 seconds

            // Cleanup on close
            return () => {
                clearInterval(heartbeat);
                removeClient(controller);
            };
        },
        cancel() {
            // Client disconnected
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
