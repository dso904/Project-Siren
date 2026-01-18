/**
 * PROJECT SIREN - Client-Side Fingerprint Collection
 * 
 * Comprehensive browser and device fingerprinting utilities
 * for user reconnaissance demonstration.
 * 
 * Collects: Device, Browser, Display, Network, Locale, Capabilities
 */

// ===================================
// TYPES
// ===================================

export interface DeviceInfo {
    type: 'iOS' | 'Android' | 'Desktop' | 'Tablet' | 'Unknown';
    os: string;
    osVersion: string;
    vendor: string;
    model: string;
    isMobile: boolean;
    isTablet: boolean;
}

export interface BrowserInfo {
    name: string;
    version: string;
    engine: string;
    userAgent: string;
    language: string;
    languages: string[];
    cookiesEnabled: boolean;
    doNotTrack: boolean;
    platform: string;
}

export interface DisplayInfo {
    screenWidth: number;
    screenHeight: number;
    availWidth: number;
    availHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    colorDepth: number;
    pixelRatio: number;
    orientation: 'portrait' | 'landscape';
    touchSupport: boolean;
    maxTouchPoints: number;
}

export interface NetworkInfo {
    connectionType: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
    onLine: boolean;
}

export interface LocaleInfo {
    timezone: string;
    timezoneOffset: number;
    language: string;
    languages: string[];
}

export interface CapabilitiesInfo {
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
    bluetooth: boolean;
    battery: boolean;
    pdfViewer: boolean;
    hardwareConcurrency: number;
    deviceMemory: number;
}

export interface HardwareInfo {
    cpuCores: number;
    deviceMemory: number;
    maxTouchPoints: number;
    hardwareConcurrency: number;
}

export interface Fingerprint {
    device: DeviceInfo;
    browser: BrowserInfo;
    display: DisplayInfo;
    network: NetworkInfo;
    locale: LocaleInfo;
    capabilities: CapabilitiesInfo;
    hardware: HardwareInfo;
    collectedAt: string;
}

// ===================================
// DEVICE DETECTION
// ===================================

function getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    const uaLower = ua.toLowerCase();

    // Detect OS and version
    let os = 'Unknown';
    let osVersion = '';
    let vendor = 'Unknown';
    let model = '';

    // iOS detection
    if (/iphone/i.test(ua)) {
        os = 'iOS';
        vendor = 'Apple';
        model = 'iPhone';
        const match = ua.match(/OS (\d+[_\.]\d+)/);
        osVersion = match ? match[1].replace('_', '.') : '';
    } else if (/ipad/i.test(ua)) {
        os = 'iPadOS';
        vendor = 'Apple';
        model = 'iPad';
        const match = ua.match(/OS (\d+[_\.]\d+)/);
        osVersion = match ? match[1].replace('_', '.') : '';
    } else if (/android/i.test(ua)) {
        os = 'Android';
        const match = ua.match(/Android\s+([\d.]+)/);
        osVersion = match ? match[1] : '';
        // Try to get device model
        const modelMatch = ua.match(/\(.*;\s*([^;)]+)\s*Build/);
        if (modelMatch) {
            model = modelMatch[1].trim();
            // Extract vendor from model
            const parts = model.split(' ');
            vendor = parts[0] || 'Unknown';
        }
    } else if (/windows/i.test(ua)) {
        os = 'Windows';
        vendor = 'Microsoft';
        if (/Windows NT 10/.test(ua)) {
            osVersion = ua.includes('Windows NT 10.0; Win64') ? '10/11' : '10';
        } else if (/Windows NT 6.3/.test(ua)) {
            osVersion = '8.1';
        } else if (/Windows NT 6.2/.test(ua)) {
            osVersion = '8';
        } else if (/Windows NT 6.1/.test(ua)) {
            osVersion = '7';
        }
    } else if (/macintosh|mac os x/i.test(ua)) {
        os = 'macOS';
        vendor = 'Apple';
        const match = ua.match(/Mac OS X (\d+[_\.]\d+)/);
        osVersion = match ? match[1].replace(/_/g, '.') : '';
    } else if (/linux/i.test(ua)) {
        os = 'Linux';
        if (/ubuntu/i.test(ua)) {
            vendor = 'Ubuntu';
        } else if (/fedora/i.test(ua)) {
            vendor = 'Fedora';
        } else if (/debian/i.test(ua)) {
            vendor = 'Debian';
        }
    } else if (/cros/i.test(ua)) {
        os = 'Chrome OS';
        vendor = 'Google';
    }

    // Detect device type
    const isMobile = /mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua);
    const isTablet = /tablet|ipad|playbook|silk/i.test(ua) ||
        (uaLower.includes('android') && !uaLower.includes('mobile'));

    let type: DeviceInfo['type'] = 'Desktop';
    if (/iphone|ipod/i.test(ua)) {
        type = 'iOS';
    } else if (/ipad/i.test(ua)) {
        type = 'Tablet';
    } else if (/android/i.test(ua)) {
        type = isTablet ? 'Tablet' : 'Android';
    } else if (isMobile) {
        type = 'Unknown';
    }

    return {
        type,
        os,
        osVersion,
        vendor,
        model,
        isMobile,
        isTablet,
    };
}

// ===================================
// BROWSER DETECTION
// ===================================

function getBrowserInfo(): BrowserInfo {
    const ua = navigator.userAgent;

    let name = 'Unknown';
    let version = '';
    let engine = 'Unknown';

    // Detect browser and version
    if (/edg\//i.test(ua)) {
        name = 'Edge';
        const match = ua.match(/Edg\/(\d+[\.\d]*)/);
        version = match ? match[1] : '';
        engine = 'Blink';
    } else if (/opr\//i.test(ua) || /opera/i.test(ua)) {
        name = 'Opera';
        const match = ua.match(/(?:OPR|Opera)\/(\d+[\.\d]*)/);
        version = match ? match[1] : '';
        engine = 'Blink';
    } else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) {
        name = 'Chrome';
        const match = ua.match(/Chrome\/(\d+[\.\d]*)/);
        version = match ? match[1] : '';
        engine = 'Blink';
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
        name = 'Safari';
        const match = ua.match(/Version\/(\d+[\.\d]*)/);
        version = match ? match[1] : '';
        engine = 'WebKit';
    } else if (/firefox/i.test(ua)) {
        name = 'Firefox';
        const match = ua.match(/Firefox\/(\d+[\.\d]*)/);
        version = match ? match[1] : '';
        engine = 'Gecko';
    } else if (/msie|trident/i.test(ua)) {
        name = 'Internet Explorer';
        const match = ua.match(/(?:MSIE |rv:)(\d+[\.\d]*)/);
        version = match ? match[1] : '';
        engine = 'Trident';
    }

    return {
        name,
        version,
        engine,
        userAgent: ua,
        language: navigator.language || 'unknown',
        languages: Array.from(navigator.languages || []),
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack === '1',
        platform: navigator.platform || 'unknown',
    };
}

// ===================================
// DISPLAY DETECTION
// ===================================

function getDisplayInfo(): DisplayInfo {
    const screen = window.screen;

    return {
        screenWidth: screen.width,
        screenHeight: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,
    };
}

// ===================================
// NETWORK DETECTION
// ===================================

function getNetworkInfo(): NetworkInfo {
    const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

    return {
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false,
        onLine: navigator.onLine,
    };
}

// ===================================
// LOCALE DETECTION
// ===================================

function getLocaleInfo(): LocaleInfo {
    const now = new Date();

    return {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
        timezoneOffset: now.getTimezoneOffset(),
        language: navigator.language || 'unknown',
        languages: Array.from(navigator.languages || []),
    };
}

// ===================================
// CAPABILITIES DETECTION
// ===================================

function getCapabilitiesInfo(): CapabilitiesInfo {
    // WebGL detection
    let webGL = false;
    let webGLVendor = 'unknown';
    let webGLRenderer = 'unknown';

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            webGL = true;
            const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                webGLVendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown';
                webGLRenderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
            }
        }
    } catch {
        // WebGL not available
    }

    // Canvas support
    let canvas = false;
    try {
        const testCanvas = document.createElement('canvas');
        canvas = !!(testCanvas.getContext && testCanvas.getContext('2d'));
    } catch {
        // Canvas not available
    }

    return {
        webGL,
        webGLVendor,
        webGLRenderer,
        canvas,
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
        indexedDB: !!window.indexedDB,
        serviceWorker: 'serviceWorker' in navigator,
        webRTC: !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection),
        geolocation: 'geolocation' in navigator,
        notifications: 'Notification' in window,
        bluetooth: 'bluetooth' in navigator,
        battery: 'getBattery' in navigator,
        pdfViewer: (navigator as any).pdfViewerEnabled ?? false,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: (navigator as any).deviceMemory || 0,
    };
}

// ===================================
// HARDWARE DETECTION
// ===================================

function getHardwareInfo(): HardwareInfo {
    return {
        cpuCores: navigator.hardwareConcurrency || 0,
        deviceMemory: (navigator as any).deviceMemory || 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
    };
}

// ===================================
// MAIN COLLECTION FUNCTION
// ===================================

export function collectFingerprint(): Fingerprint {
    return {
        device: getDeviceInfo(),
        browser: getBrowserInfo(),
        display: getDisplayInfo(),
        network: getNetworkInfo(),
        locale: getLocaleInfo(),
        capabilities: getCapabilitiesInfo(),
        hardware: getHardwareInfo(),
        collectedAt: new Date().toISOString(),
    };
}

/**
 * Collect fingerprint as a serializable object for API transmission
 */
export function collectFingerprintForAPI(): Record<string, unknown> {
    const fp = collectFingerprint();
    return JSON.parse(JSON.stringify(fp));
}
