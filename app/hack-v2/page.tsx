"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

// V2 Components
import { NeuralNetwork } from "@/components/v2/backgrounds/NeuralNetwork";
import { TacticalGrid } from "@/components/v2/backgrounds/TacticalGrid";
import { HackingDials } from "@/components/v2/hacking/HackingDials";
import { CodeTerminal } from "@/components/v2/hacking/CodeTerminal";
import { WorldMapPanel } from "@/components/v2/hacking/WorldMapPanel";
import { CredentialsList } from "@/components/v2/hacking/CredentialsList";
import { DataStream } from "@/components/v2/hacking/DataStream";
import { StatsPanel } from "@/components/v2/hacking/StatsPanel";
import { RadarSweep } from "@/components/v2/hacking/RadarSweep";
import { SystemHeader } from "@/components/v2/hacking/SystemHeader";

/**
 * HACK V2 - Cinematic Tactical HUD
 * 
 * A sophisticated, Hollywood-grade hacking simulation interface
 * featuring real-time HUD graphics, neural network backgrounds,
 * and cinematographic visual effects for maximum impact.
 */

export default function HackV2Page() {
    const router = useRouter();
    const [phase, setPhase] = useState<"initializing" | "scanning" | "cracking" | "extracting" | "breach" | "complete">("initializing");
    const [progress, setProgress] = useState(0);
    const [systemTime, setSystemTime] = useState(new Date());

    // Track visit
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

    // System clock
    useEffect(() => {
        const timer = setInterval(() => {
            setSystemTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Phase progression
    useEffect(() => {
        const phases: typeof phase[] = ["initializing", "scanning", "cracking", "extracting", "breach"];
        const durations = [2000, 3000, 5000, 3000, 2000]; // Duration for each phase

        let currentPhaseIndex = 0;
        let progressInterval: NodeJS.Timeout;

        const advancePhase = () => {
            if (currentPhaseIndex < phases.length) {
                setPhase(phases[currentPhaseIndex]);
                setProgress(0);

                // Progress animation within phase
                const duration = durations[currentPhaseIndex];
                const steps = 100;
                const stepDuration = duration / steps;
                let currentProgress = 0;

                progressInterval = setInterval(() => {
                    currentProgress += 1;
                    setProgress(currentProgress);

                    if (currentProgress >= 100) {
                        clearInterval(progressInterval);
                        currentPhaseIndex++;

                        if (currentPhaseIndex < phases.length) {
                            setTimeout(advancePhase, 300);
                        } else {
                            setPhase("complete");
                            // Navigate to digital arrest after breach
                            setTimeout(() => {
                                router.push("/digital-arrest");
                            }, 1500);
                        }
                    }
                }, stepDuration);
            }
        };

        const startTimer = setTimeout(advancePhase, 500);

        return () => {
            clearTimeout(startTimer);
            clearInterval(progressInterval);
        };
    }, [router]);

    const getPhaseLabel = () => {
        switch (phase) {
            case "initializing": return "INITIALIZING ATTACK VECTOR";
            case "scanning": return "SCANNING TARGET NETWORK";
            case "cracking": return "CRACKING ENCRYPTION";
            case "extracting": return "EXTRACTING CREDENTIALS";
            case "breach": return "SYSTEM BREACH DETECTED";
            case "complete": return "ACCESS GRANTED";
            default: return "STANDBY";
        }
    };

    return (
        <div className={styles.container}>
            {/* Background Layers */}
            <div className={styles.backgroundLayers}>
                <NeuralNetwork intensity={phase === "cracking" ? 0.8 : 0.4} />
                <TacticalGrid />
            </div>

            {/* Scanlines Overlay */}
            <div className={styles.scanlines} />

            {/* Vignette Effect */}
            <div className={styles.vignette} />

            {/* Admin Access Button */}
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
            </motion.a>

            {/* V1 Toggle Link */}
            <motion.a
                href="/hack"
                className={styles.versionToggle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
            >
                V1
            </motion.a>

            {/* Main HUD Container */}
            <main className={styles.hudContainer}>
                {/* System Header */}
                <SystemHeader
                    phase={phase}
                    phaseLabel={getPhaseLabel()}
                    systemTime={systemTime}
                    progress={progress}
                />

                {/* Main Content Grid */}
                <div className={styles.mainGrid}>
                    {/* Left Column */}
                    <div className={styles.leftColumn}>
                        {/* Code Terminal */}
                        <motion.div
                            className={styles.panel}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <CodeTerminal phase={phase} />
                        </motion.div>

                        {/* Credentials List */}
                        <motion.div
                            className={styles.panel}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <CredentialsList phase={phase} />
                        </motion.div>
                    </div>

                    {/* Center Column - Main Focus */}
                    <div className={styles.centerColumn}>
                        {/* Dual Hacking Dials */}
                        <motion.div
                            className={styles.dialsContainer}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                        >
                            <HackingDials phase={phase} progress={progress} />
                        </motion.div>

                        {/* Bottom Center - Data Stream */}
                        <motion.div
                            className={styles.dataStreamContainer}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <DataStream phase={phase} />
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className={styles.rightColumn}>
                        {/* Stats Panel */}
                        <motion.div
                            className={styles.panel}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <StatsPanel phase={phase} progress={progress} />
                        </motion.div>

                        {/* World Map */}
                        <motion.div
                            className={styles.panel}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <WorldMapPanel phase={phase} />
                        </motion.div>

                        {/* Radar */}
                        <motion.div
                            className={styles.panel}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <RadarSweep active={phase !== "complete"} />
                        </motion.div>
                    </div>
                </div>

                {/* Phase Status Bar */}
                <motion.div
                    className={styles.phaseBar}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <div className={styles.phaseIndicator}>
                        <span className={styles.phaseLabel}>{getPhaseLabel()}</span>
                        <div className={styles.progressBar}>
                            <motion.div
                                className={styles.progressFill}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                        <span className={styles.progressText}>{progress}%</span>
                    </div>
                </motion.div>
            </main>

            {/* Breach Flash Effect */}
            <AnimatePresence>
                {phase === "breach" && (
                    <motion.div
                        className={styles.breachFlash}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0, 1, 0, 0.5] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, times: [0, 0.1, 0.2, 0.3, 0.4, 1] }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
