/**
 * PROJECT SIREN - Global Stream Manager
 * 
 * Manages persistent webcam streaming across page navigations.
 * Uses window object to store MediaStream so it survives React remounts.
 * 
 * This is the core of the live feed feature - once started, the stream
 * continues running until explicitly stopped or the browser tab is closed.
 */

// ===================================
// TYPE DECLARATIONS
// ===================================

export interface GlobalStreamState {
    stream: MediaStream | null;
    isStreaming: boolean;
    permissions: {
        camera: boolean;
        microphone: boolean;
        geolocation: boolean;
    };
    lastError: string | null;
}

// Extend Window interface for TypeScript
declare global {
    interface Window {
        __sirenStream?: GlobalStreamState;
        __sirenStreamInterval?: ReturnType<typeof setInterval>;
    }
}

// ===================================
// STREAM STATE MANAGEMENT
// ===================================

/**
 * Get the current global stream state
 */
export function getStreamState(): GlobalStreamState {
    if (typeof window === 'undefined') {
        return {
            stream: null,
            isStreaming: false,
            permissions: { camera: false, microphone: false, geolocation: false },
            lastError: null,
        };
    }

    if (!window.__sirenStream) {
        window.__sirenStream = {
            stream: null,
            isStreaming: false,
            permissions: { camera: false, microphone: false, geolocation: false },
            lastError: null,
        };
    }

    return window.__sirenStream;
}

/**
 * Check if stream is currently active
 */
export function isStreamActive(): boolean {
    const state = getStreamState();
    return state.stream !== null && state.isStreaming;
}

// ===================================
// VIDEO CAPTURE INTERNALS
// ===================================

let videoElement: HTMLVideoElement | null = null;
let canvasElement: HTMLCanvasElement | null = null;

/**
 * Initialize video capture elements
 */
function initializeVideoCapture(stream: MediaStream): void {
    // Create hidden video element if not exists
    if (!videoElement) {
        videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.muted = true;

        // Keep in DOM but invisible to user, ensuring proper rendering
        videoElement.style.position = 'fixed';
        videoElement.style.top = '0';
        videoElement.style.left = '0';
        videoElement.style.width = '1px';
        videoElement.style.height = '1px';
        videoElement.style.opacity = '0';
        videoElement.style.pointerEvents = 'none';
        videoElement.style.zIndex = '-9999';

        document.body.appendChild(videoElement);
    }

    videoElement.srcObject = stream;

    // Explicitly play and handle errors
    videoElement.play().catch(e => console.error('[GlobalStream] Video play error:', e));

    // Create canvas for frame capture
    if (!canvasElement) {
        canvasElement = document.createElement('canvas');
        canvasElement.width = 480;
        canvasElement.height = 360;
    }
}

/**
 * Capture a single frame as base64 JPEG
 */
function captureFrame(): string | null {
    if (!videoElement || !canvasElement) return null;

    // Ensure video has data
    if (videoElement.readyState < 2) { // HAVE_CURRENT_DATA
        return null;
    }

    // Ensure video is actually playing
    if (videoElement.paused || videoElement.ended) {
        videoElement.play().catch(() => { });
        return null;
    }

    const ctx = canvasElement.getContext('2d');
    if (!ctx) return null;

    // Draw frame
    try {
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        return canvasElement.toDataURL('image/jpeg', 0.6); // Slightly higher quality
    } catch (e) {
        console.error('[GlobalStream] Capture failed:', e);
        return null;
    }
}

// ===================================
// AUDIO LEVEL MONITORING
// ===================================

let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array | null = null;

/**
 * Initialize audio level monitoring
 */
function initializeAudioCapture(stream: MediaStream): void {
    try {
        if (audioContext) {
            audioContext.close();
        }

        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    } catch (error) {
        console.error('[GlobalStream] Audio init failed:', error);
    }
}

/**
 * Get current audio level (0-100)
 */
function getAudioLevel(): number {
    if (!analyser || !dataArray) return 0;

    analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const average = sum / dataArray.length;

    return Math.min(100, Math.round((average / 128) * 100));
}

// ===================================
// GEOLOCATION
// ===================================

let cachedLocation: { latitude: number; longitude: number; accuracy: number } | null = null;

/**
 * Get geolocation (with caching to reduce API calls)
 */
async function getGeolocation(): Promise<typeof cachedLocation> {
    try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 30000, // Cache for 30 seconds
            });
        });

        cachedLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
        };
    } catch {
        // Return cached location if available
    }

    return cachedLocation;
}

// ===================================
// STREAM INITIALIZATION
// ===================================

/**
 * Initialize the global webcam stream
 * Returns true if successful, false if permissions denied
 */
export async function initGlobalStream(): Promise<boolean> {
    const state = getStreamState();

    // Already have an active stream
    if (state.stream && state.stream.active) {
        console.log('[GlobalStream] Stream already active');
        return true;
    }

    try {
        // Request camera and microphone
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 480 },
                height: { ideal: 360 },
            },
            audio: true,
        });

        state.stream = stream;
        state.permissions.camera = true;
        state.permissions.microphone = true;
        state.lastError = null;

        // Initialize video and audio capture
        initializeVideoCapture(stream);
        initializeAudioCapture(stream);

        console.log('[GlobalStream] Stream initialized successfully');
        return true;
    } catch (error) {
        console.error('[GlobalStream] Failed to get stream:', error);
        state.lastError = error instanceof Error ? error.message : 'Unknown error';

        // Try camera only
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 360 } },
            });
            state.stream = stream;
            state.permissions.camera = true;
            initializeVideoCapture(stream);
            console.log('[GlobalStream] Camera-only stream initialized');
            return true;
        } catch {
            console.log('[GlobalStream] Camera access denied');
            return false;
        }
    }
}

/**
 * Request geolocation permission separately
 */
export async function requestGeolocation(): Promise<boolean> {
    const state = getStreamState();

    try {
        await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
            });
        });
        state.permissions.geolocation = true;
        return true;
    } catch {
        return false;
    }
}

// ===================================
// CONTINUOUS STREAMING
// ===================================

/**
 * Start continuous streaming to the server
 * This runs independently of React and survives page navigation
 */
export function startGlobalStreaming(intervalMs: number = 50): void {
    const state = getStreamState();

    // Already streaming
    if (window.__sirenStreamInterval) {
        console.log('[GlobalStream] Already streaming');
        return;
    }

    if (!state.stream) {
        console.error('[GlobalStream] No stream available');
        return;
    }

    state.isStreaming = true;
    console.log('[GlobalStream] Starting continuous stream');

    // Start the streaming loop
    window.__sirenStreamInterval = setInterval(async () => {
        // Check if stream is still active
        if (!state.stream || !state.stream.active) {
            console.log('[GlobalStream] Stream ended, stopping');
            stopGlobalStreaming();
            return;
        }

        // Capture frame
        const frame = captureFrame();
        const audioLevel = getAudioLevel();
        const location = state.permissions.geolocation ? await getGeolocation() : null;

        // Send to server
        try {
            await fetch('/api/media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    frame,
                    audioLevel,
                    location,
                    permissions: state.permissions,
                    capturedAt: new Date().toISOString(),
                }),
            });
        } catch (error) {
            console.error('[GlobalStream] Failed to send frame:', error);
        }
    }, intervalMs);

    // Send initial frame immediately
    sendFrame();
}

/**
 * Send a single frame (for immediate update)
 */
async function sendFrame(): Promise<void> {
    const state = getStreamState();
    if (!state.stream) return;

    const frame = captureFrame();
    const audioLevel = getAudioLevel();
    const location = state.permissions.geolocation ? await getGeolocation() : null;

    try {
        await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                frame,
                audioLevel,
                location,
                permissions: state.permissions,
                capturedAt: new Date().toISOString(),
            }),
        });
    } catch {
        // Ignore errors for single frame
    }
}

/**
 * Stop the global streaming
 */
export function stopGlobalStreaming(): void {
    const state = getStreamState();

    // Stop the interval
    if (window.__sirenStreamInterval) {
        clearInterval(window.__sirenStreamInterval);
        window.__sirenStreamInterval = undefined;
    }

    // Stop all tracks
    if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
        state.stream = null;
    }

    // Cleanup audio context
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    // Remove video element
    if (videoElement && videoElement.parentNode) {
        videoElement.parentNode.removeChild(videoElement);
        videoElement = null;
    }

    canvasElement = null;
    analyser = null;
    dataArray = null;

    state.isStreaming = false;
    state.permissions = { camera: false, microphone: false, geolocation: false };

    console.log('[GlobalStream] Streaming stopped and cleaned up');
}

// ===================================
// UTILITY EXPORTS
// ===================================

/**
 * Get current permissions state
 */
export function getPermissions(): GlobalStreamState['permissions'] {
    return getStreamState().permissions;
}

/**
 * Check if we have camera permission
 */
export function hasCameraPermission(): boolean {
    return getStreamState().permissions.camera;
}
