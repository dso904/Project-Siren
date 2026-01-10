"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    MatrixRain,
    HackerAgentAnimation,
    TerminalLog,
    GlitchOverlay,
} from "@/components/effects";
import styles from "./page.module.css";

/**
 * Hack Simulation Page
 * 
 * The main "scare" page that victims see when they connect.
 * Features:
 * - Matrix rain background
 * - Lock brute-force animation
 * - Terminal-style progress logs
 * - Glitch transition effect
 * - Auto-redirect after ~8 seconds
 */

// Terminal log entries with timing
const HACK_SEQUENCE = [
    { message: "Initializing connection intercept...", type: "info" as const, delay: 0 },
    { message: "Target device detected: MOBILE_DEVICE", type: "warning" as const, delay: 800 },
    { message: "Bypassing SSL handshake... SUCCESS", type: "success" as const, delay: 1600 },
    { message: "Injecting packet sniffer...", type: "info" as const, delay: 2400 },
    { message: "Accessing browser cookies... SUCCESS", type: "success" as const, delay: 3200 },
    { message: "Cloning session tokens...", type: "info" as const, delay: 4000 },
    { message: "Extracting saved passwords... PENDING", type: "pending" as const, delay: 4800 },
    { message: "WARNING: Gallery access detected", type: "warning" as const, delay: 5600 },
    { message: "CRITICAL: Full device access obtained", type: "error" as const, delay: 6400 },
];

export default function HackPage() {
    const router = useRouter();
    const [phase, setPhase] = useState<"loading" | "hacking" | "glitch" | "redirect">("loading");
    const [terminalComplete, setTerminalComplete] = useState(false);
    const [lockComplete, setLockComplete] = useState(false);

    // Track this visit
    useEffect(() => {
        const trackVisit = async () => {
            try {
                await fetch("/api/track", { method: "POST" });
            } catch (error) {
                console.error("Failed to track visit:", error);
            }
        };
        trackVisit();
    }, []);

    // Start hacking sequence after brief loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setPhase("hacking");
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Check for redirect condition
    useEffect(() => {
        if (terminalComplete && lockComplete && phase === "hacking") {
            // Start glitch phase
            setPhase("glitch");
        }
    }, [terminalComplete, lockComplete, phase]);

    // Handle glitch completion
    const handleGlitchComplete = useCallback(() => {
        setPhase("redirect");
        // Navigate to reveal page
        router.push("/reveal");
    }, [router]);

    return (
        <div className={styles.container}>
            {/* Matrix rain background */}
            <MatrixRain
                color="#ff073a"
                highlightColor="#ff4444"
                charset="mixed"
                fontSize={14}
                speed={1.2}
                fadeOpacity={0.03}
            />

            {/* Scanlines overlay */}
            <div className={styles.scanlines} />

            {/* Main content */}
            <AnimatePresence>
                {phase !== "redirect" && (
                    <motion.main
                        className={styles.main}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Header warning */}
                        <motion.header
                            className={styles.header}
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                        >
                            <div className={styles.warningIcon}>⚠</div>
                            <h1 className={styles.title}>
                                <span className={styles.glitchText} data-text="SECURITY BREACH">
                                    SECURITY BREACH
                                </span>
                            </h1>
                            <p className={styles.subtitle}>Unauthorized access detected</p>
                        </motion.header>

                        {/* Lock animation */}
                        <motion.section
                            className={styles.lockSection}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <HackerAgentAnimation
                                duration={6}
                                isActive={phase === "hacking"}
                                onComplete={() => setLockComplete(true)}
                            />
                        </motion.section>

                        {/* Terminal log */}
                        <motion.section
                            className={styles.terminalSection}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                        >
                            <TerminalLog
                                entries={HACK_SEQUENCE}
                                typingSpeed={15}
                                onComplete={() => setTerminalComplete(true)}
                            />
                        </motion.section>

                        {/* Status indicator */}
                        <motion.footer
                            className={styles.footer}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            <div className={styles.statusDot} />
                            <span className={styles.statusText}>
                                {phase === "loading" && "Connecting..."}
                                {phase === "hacking" && "Attack in progress..."}
                                {phase === "glitch" && "BREACH COMPLETE"}
                            </span>
                        </motion.footer>
                    </motion.main>
                )}
            </AnimatePresence>

            {/* Glitch transition overlay */}
            <GlitchOverlay
                isActive={phase === "glitch"}
                intensity={0.9}
                duration={2}
                onComplete={handleGlitchComplete}
                shake={true}
            />
        </div>
    );
}
