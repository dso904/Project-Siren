"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./TerminalLog.module.css";

/**
 * TerminalLog Component
 * 
 * Simulates a hacking terminal with typewriter effect.
 * Shows fake hack progress messages with timestamps.
 */

interface LogEntry {
    id: number;
    message: string;
    type: "info" | "success" | "warning" | "error" | "pending";
    timestamp: string;
}

interface TerminalLogProps {
    /** Log entries to display */
    entries: {
        message: string;
        type: LogEntry["type"];
        delay: number; // Delay in ms before showing this entry
    }[];
    /** Typing speed in ms per character */
    typingSpeed?: number;
    /** Callback when all entries are complete */
    onComplete?: () => void;
    /** Additional CSS classes */
    className?: string;
}

export default function TerminalLog({
    entries,
    typingSpeed = 20,
    onComplete,
    className = "",
}: TerminalLogProps) {
    const [displayedEntries, setDisplayedEntries] = useState<LogEntry[]>([]);
    const [currentlyTyping, setCurrentlyTyping] = useState<string>("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get current timestamp
    const getTimestamp = () => {
        return new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    // Type out entries one by one
    useEffect(() => {
        if (currentIndex >= entries.length) {
            onComplete?.();
            return;
        }

        const entry = entries[currentIndex];

        // Wait for the delay before starting this entry
        const delayTimeout = setTimeout(() => {
            let charIndex = 0;
            setCurrentlyTyping("");

            // Type out the message character by character
            const typingInterval = setInterval(() => {
                if (charIndex < entry.message.length) {
                    setCurrentlyTyping((prev) => prev + entry.message[charIndex]);
                    charIndex++;
                } else {
                    clearInterval(typingInterval);

                    // Add the complete entry
                    setDisplayedEntries((prev) => [
                        ...prev,
                        {
                            id: currentIndex,
                            message: entry.message,
                            type: entry.type,
                            timestamp: getTimestamp(),
                        },
                    ]);
                    setCurrentlyTyping("");
                    setCurrentIndex((prev) => prev + 1);
                }
            }, typingSpeed);

            return () => clearInterval(typingInterval);
        }, entry.delay);

        return () => clearTimeout(delayTimeout);
    }, [currentIndex, entries, typingSpeed, onComplete]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [displayedEntries, currentlyTyping]);

    const getTypeIcon = (type: LogEntry["type"]) => {
        switch (type) {
            case "success":
                return "✓";
            case "warning":
                return "⚠";
            case "error":
                return "✗";
            case "pending":
                return "◌";
            default:
                return "›";
        }
    };

    return (
        <div className={`${styles.terminal} ${className}`} ref={containerRef}>
            {/* Terminal header */}
            <div className={styles.header}>
                <div className={styles.headerDots}>
                    <span className={styles.dot} style={{ background: "#ff5f56" }} />
                    <span className={styles.dot} style={{ background: "#ffbd2e" }} />
                    <span className={styles.dot} style={{ background: "#27ca3f" }} />
                </div>
                <span className={styles.headerTitle}>siren@exploit:~$ </span>
            </div>

            {/* Log entries */}
            <div className={styles.logContainer}>
                <AnimatePresence>
                    {displayedEntries.map((entry) => (
                        <motion.div
                            key={entry.id}
                            className={`${styles.logEntry} ${styles[entry.type]}`}
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: "auto" }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className={styles.timestamp}>[{entry.timestamp}]</span>
                            <span className={styles.icon}>{getTypeIcon(entry.type)}</span>
                            <span className={styles.message}>{entry.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Currently typing entry */}
                {currentlyTyping && (
                    <div className={`${styles.logEntry} ${styles.typing}`}>
                        <span className={styles.timestamp}>[{getTimestamp()}]</span>
                        <span className={styles.icon}>›</span>
                        <span className={styles.message}>
                            {currentlyTyping}
                            <span className={styles.cursor}>▊</span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
