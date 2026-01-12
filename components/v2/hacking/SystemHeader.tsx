"use client";

import { motion } from "framer-motion";
import styles from "./SystemHeader.module.css";

/**
 * SystemHeader Component
 * 
 * Top header bar with system status, phase indicator,
 * and real-time clock.
 */

interface SystemHeaderProps {
    phase: "initializing" | "scanning" | "cracking" | "extracting" | "breach" | "complete";
    phaseLabel: string;
    systemTime: Date;
    progress: number;
    className?: string;
}

export function SystemHeader({
    phase,
    phaseLabel,
    systemTime,
    progress,
    className = ""
}: SystemHeaderProps) {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    return (
        <header className={`${styles.header} ${className}`}>
            {/* Left Section - Logo */}
            <div className={styles.leftSection}>
                <motion.div
                    className={styles.logo}
                    animate={{ rotate: phase === "cracking" ? 360 : 0 }}
                    transition={{ duration: 2, repeat: phase === "cracking" ? Infinity : 0, ease: "linear" }}
                >
                    <div className={styles.logoInner}>V9</div>
                    <div className={styles.logoRing} />
                </motion.div>
                <div className={styles.systemInfo}>
                    <span className={styles.systemName}>PROJECT SIREN</span>
                    <span className={styles.systemVersion}>v2.0 // TACTICAL HUD</span>
                </div>
            </div>

            {/* Center Section - Status */}
            <div className={styles.centerSection}>
                <div className={styles.statusIndicator}>
                    <motion.span
                        className={`${styles.statusDot} ${phase === "breach" || phase === "complete" ? styles.breach : ""}`}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: phase === "breach" ? [1, 0.5, 1] : 1
                        }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />
                    <span className={styles.statusText}>
                        {phase === "complete" ? "SYSTEM COMPROMISED" : "ATTACK IN PROGRESS"}
                    </span>
                </div>
                <div className={styles.connectionInfo}>
                    <span className={styles.connLabel}>CONN:</span>
                    <span className={styles.connValue}>192.168.1.x</span>
                    <span className={styles.connLabel}>PORT:</span>
                    <span className={styles.connValue}>443</span>
                </div>
            </div>

            {/* Right Section - Time */}
            <div className={styles.rightSection}>
                <div className={styles.datetime}>
                    <span className={styles.time}>{formatTime(systemTime)}</span>
                    <span className={styles.date}>{formatDate(systemTime)}</span>
                </div>
                <div className={styles.systemStats}>
                    <span className={styles.statItem}>CPU: {Math.min(99, 45 + progress * 0.5).toFixed(0)}%</span>
                    <span className={styles.statItem}>MEM: {Math.min(95, 30 + progress * 0.6).toFixed(0)}%</span>
                </div>
            </div>
        </header>
    );
}

export default SystemHeader;
