"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./TrafficLog.module.css";
import { Victim } from "@/lib/sessions";

/**
 * TrafficLog Component
 * 
 * A real-time scrolling terminal showing device connections.
 * Features auto-scroll, colored entries, and glowing effects.
 */

interface TrafficLogProps {
    entries: Victim[];
    maxEntries?: number;
    className?: string;
}

export default function TrafficLog({
    entries,
    maxEntries = 15,
    className = "",
}: TrafficLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [entries]);

    const displayEntries = entries.slice(-maxEntries);

    const getDeviceColor = (device: string) => {
        switch (device) {
            case "iOS":
                return "#ff9500";
            case "Android":
                return "#00ff88";
            case "Desktop":
                return "#00f0ff";
            default:
                return "#888888";
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <div className={`${styles.container} ${className}`}>
            {/* Terminal header */}
            <div className={styles.header}>
                <div className={styles.headerDots}>
                    <span className={styles.dot} data-color="red" />
                    <span className={styles.dot} data-color="yellow" />
                    <span className={styles.dot} data-color="green" />
                </div>
                <span className={styles.headerTitle}>
                    siren@network:~$ tail -f /var/log/connections
                </span>
                <motion.div
                    className={styles.liveIndicator}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    LIVE
                </motion.div>
            </div>

            {/* Log content */}
            <div className={styles.logContainer} ref={scrollRef}>
                <AnimatePresence initial={false}>
                    {displayEntries.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span className={styles.cursor}>█</span>
                            <span className={styles.waitingText}>Waiting for connections...</span>
                        </div>
                    ) : (
                        displayEntries.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                className={styles.logEntry}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: "auto" }}
                                exit={{ opacity: 0, x: 20, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <span className={styles.timestamp}>[{formatTime(entry.timestamp)}]</span>
                                <span className={styles.arrow}>→</span>
                                <span
                                    className={styles.device}
                                    style={{ color: getDeviceColor(entry.device) }}
                                >
                                    {entry.device}
                                </span>
                                <span className={styles.separator}>|</span>
                                <span className={styles.browser}>{entry.browser}</span>
                                <span className={styles.separator}>|</span>
                                <span className={styles.ip}>{entry.ip}</span>
                                <motion.span
                                    className={styles.newBadge}
                                    initial={{ opacity: 1, scale: 1.2 }}
                                    animate={{ opacity: 0, scale: 1 }}
                                    transition={{ delay: 2, duration: 0.5 }}
                                >
                                    NEW
                                </motion.span>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>

                {/* Cursor at bottom */}
                <div className={styles.cursorLine}>
                    <span className={styles.prompt}>$ </span>
                    <motion.span
                        className={styles.cursor}
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        █
                    </motion.span>
                </div>
            </div>

            {/* Scanline effect */}
            <div className={styles.scanline} />
        </div>
    );
}
