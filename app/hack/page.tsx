"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    MatrixRain,
    HackerAgentAnimation,
    TerminalLog,
    SystemBreachEffect,
} from "@/components/effects";
import { VictimData, performOSINT, generateTerminalOutput, OSINTResult } from "@/lib/osint";
import styles from "./page.module.css";

/**
 * Hack Simulation Page
 * 
 * The main "scare" page that victims see when they connect.
 * Now includes OSINT-style reconnaissance based on portal data.
 * 
 * Features:
 * - Matrix rain background
 * - Suspicious user info display (top-right)
 * - OSINT-based terminal logs
 * - Glitch transition effect
 */

// Fallback terminal entries if no victim data
const FALLBACK_SEQUENCE = [
    { message: "[OSINT] Initiating reconnaissance on target...", type: "info" as const, delay: 0 },
    { message: "[SCAN] Analyzing network fingerprint...", type: "warning" as const, delay: 800 },
    { message: "   ├─ Device: Mobile/Desktop detected", type: "info" as const, delay: 400 },
    { message: "   └─ Browser: User agent captured", type: "success" as const, delay: 300 },
    { message: "[SCAN] No portal data provided...", type: "warning" as const, delay: 600 },
    { message: "[WARNING] Anonymous target - limited OSINT possible", type: "error" as const, delay: 500 },
    { message: "[STATUS] Device fingerprint captured", type: "success" as const, delay: 800 },
    { message: "[ALERT] Proceeding with available data...", type: "error" as const, delay: 600 },
];

interface VictimDisplayData {
    name?: string;
    email?: string;
    phone?: string;
}

export default function HackPage() {
    const router = useRouter();
    const [phase, setPhase] = useState<"loading" | "hacking" | "glitch" | "redirect">("loading");
    const [terminalComplete, setTerminalComplete] = useState(false);
    const [lockComplete, setLockComplete] = useState(false);
    const [victimData, setVictimData] = useState<VictimDisplayData | null>(null);
    const [terminalEntries, setTerminalEntries] = useState<{ message: string; type: "info" | "success" | "warning" | "error" | "pending"; delay: number }[]>([]);
    const [osintReady, setOsintReady] = useState(false);

    const handleTerminalComplete = useCallback(() => {
        setTerminalComplete(true);
    }, []);

    const handleLockComplete = useCallback(() => {
        setLockComplete(true);
    }, []);

    // Load victim data and generate OSINT
    useEffect(() => {
        const loadVictimData = async () => {
            try {
                const storedData = sessionStorage.getItem("siren_victim");
                if (storedData) {
                    const victim: VictimData = JSON.parse(storedData);
                    setVictimData({
                        name: victim.name || undefined,
                        email: victim.email || undefined,
                        phone: victim.phone || undefined,
                    });

                    // Generate OSINT findings
                    const osintResult = await performOSINT(victim);
                    const terminalLines = generateTerminalOutput(osintResult, victim);

                    // Convert to terminal entry format
                    const entries = terminalLines.map((line, index) => ({
                        message: line.text,
                        type: mapLineType(line.type),
                        delay: index === 0 ? 0 : 300 + (index * 100),
                    }));

                    setTerminalEntries(entries);
                } else {
                    setTerminalEntries(FALLBACK_SEQUENCE);
                }
            } catch (error) {
                console.error("Failed to load victim data:", error);
                setTerminalEntries(FALLBACK_SEQUENCE);
            }
            setOsintReady(true);
        };

        loadVictimData();
    }, []);

    // Convert OSINT line types to terminal types
    const mapLineType = (type: string): "info" | "success" | "warning" | "error" | "pending" => {
        switch (type) {
            case "header": return "warning";
            case "subitem": return "info";
            case "success": return "success";
            case "error": return "error";
            case "warning": return "warning";
            default: return "info";
        }
    };

    // Start hacking sequence after OSINT is ready
    useEffect(() => {
        if (!osintReady) return;

        const timer = setTimeout(() => {
            setPhase("hacking");
        }, 500);
        return () => clearTimeout(timer);
    }, [osintReady]);

    // Check for redirect condition
    useEffect(() => {
        if (terminalComplete && lockComplete && phase === "hacking") {
            setPhase("glitch");
        }
    }, [terminalComplete, lockComplete, phase]);

    // Handle glitch completion
    const handleGlitchComplete = useCallback(() => {
        setPhase("redirect");
        router.push("/digital-arrest");
    }, [router]);

    // Get display name for suspicious badge
    const getDisplayIdentifier = () => {
        if (victimData?.name) return victimData.name;
        if (victimData?.email) return victimData.email.split("@")[0];
        if (victimData?.phone) return `+91 ${victimData.phone.slice(0, 5)}***`;
        return null;
    };

    const displayId = getDisplayIdentifier();

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

            {/* Admin Access Button - Top Left */}
            <motion.a
                href="/admin"
                className={styles.adminButton}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className={styles.adminIcon}>⌘</span>
                <span className={styles.adminText}>ADMIN</span>
                <div className={styles.adminGlow} />
            </motion.a>

            {/* Suspicious User Info Badge - Top Right */}
            {displayId && (
                <motion.div
                    className={styles.victimBadge}
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                >
                    <div className={styles.victimBadgeInner}>
                        <div className={styles.victimIcon}>👁️</div>
                        <div className={styles.victimInfo}>
                            <span className={styles.victimLabel}>TARGET IDENTIFIED</span>
                            <span className={styles.victimName}>{displayId}</span>
                            {victimData?.email && victimData.name && (
                                <span className={styles.victimEmail}>{victimData.email}</span>
                            )}
                        </div>
                        <div className={styles.victimPulse} />
                    </div>
                    <div className={styles.victimGlitch} />
                </motion.div>
            )}

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
                                duration={7}
                                isActive={phase === "hacking"}
                                onComplete={handleLockComplete}
                            />
                        </motion.section>

                        {/* Terminal log - OSINT-powered */}
                        {osintReady && terminalEntries.length > 0 && (
                            <motion.section
                                className={styles.terminalSection}
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                            >
                                <TerminalLog
                                    entries={terminalEntries}
                                    typingSpeed={12}
                                    onComplete={handleTerminalComplete}
                                />
                            </motion.section>
                        )}

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
                                {phase === "hacking" && !lockComplete && "OSINT scan in progress..."}
                                {phase === "hacking" && lockComplete && "ACCESS GRANTED"}
                                {phase === "glitch" && "BREACH COMPLETE"}
                            </span>
                        </motion.footer>
                    </motion.main>
                )}
            </AnimatePresence>

            {/* Cinematic breach transition */}
            <SystemBreachEffect
                isActive={phase === "glitch"}
                duration={6000}
                onComplete={handleGlitchComplete}
            />
        </div>
    );
}

