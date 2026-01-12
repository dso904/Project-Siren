"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./StatsPanel.module.css";

/**
 * StatsPanel Component
 * 
 * Horizontal bar graphs showing attack statistics
 * with animated fill progress.
 */

interface StatsPanelProps {
    phase: "initializing" | "scanning" | "cracking" | "extracting" | "breach" | "complete";
    progress: number;
    className?: string;
}

interface Stat {
    label: string;
    value: number;
    max: number;
}

export function StatsPanel({ phase, progress, className = "" }: StatsPanelProps) {
    const [stats, setStats] = useState<Stat[]>([
        { label: "1.", value: 0, max: 99999999 },
        { label: "2.", value: 0, max: 99999999 },
        { label: "3.", value: 0, max: 99999999 },
        { label: "4.", value: 0, max: 99999999 },
        { label: "5.", value: 0, max: 99999999 },
    ]);

    // Update stats based on phase and progress
    useEffect(() => {
        const multiplier = {
            initializing: 0.1,
            scanning: 0.3,
            cracking: 0.6,
            extracting: 0.85,
            breach: 0.95,
            complete: 1,
        }[phase] || 0;

        const baseProgress = (progress / 100) * multiplier;

        setStats([
            { label: "1.", value: Math.floor(41735888 * baseProgress), max: 41735888 },
            { label: "2.", value: Math.floor(99999999 * baseProgress * 0.8), max: 99999999 },
            { label: "3.", value: Math.floor(78452190 * baseProgress * 0.9), max: 78452190 },
            { label: "4.", value: Math.floor(56231489 * baseProgress * 0.7), max: 56231489 },
            { label: "5.", value: Math.floor(91783567 * baseProgress * 0.85), max: 91783567 },
        ]);
    }, [phase, progress]);

    const formatNumber = (num: number) => {
        return num.toString().padStart(8, "0");
    };

    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.header}>
                <span className={styles.title}>SYSTEM DATA</span>
                <div className={styles.indicators}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <motion.span
                            key={i}
                            className={styles.dot}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.stats}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statRow}>
                        <span className={styles.label}>{stat.label}</span>
                        <div className={styles.barContainer}>
                            <motion.div
                                className={styles.barFill}
                                initial={{ width: 0 }}
                                animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <span className={styles.value}>{formatNumber(stat.value)}</span>
                    </div>
                ))}
            </div>

            {/* Secondary numbers display */}
            <div className={styles.secondary}>
                <div className={styles.secondaryRow}>
                    <span className={styles.secondaryValue}>041783567</span>
                </div>
            </div>
        </div>
    );
}

export default StatsPanel;
