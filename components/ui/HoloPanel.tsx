"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import styles from "./HoloPanel.module.css";

/**
 * HoloPanel Component
 * 
 * A futuristic holographic panel with animated borders,
 * glassmorphism, and breathing glow effects.
 * Inspired by Minority Report / Cyberpunk 2077 UI.
 */

interface HoloPanelProps {
    children: ReactNode;
    title?: string;
    icon?: string;
    variant?: "default" | "warning" | "success" | "critical";
    size?: "sm" | "md" | "lg" | "full";
    className?: string;
    animate?: boolean;
}

export default function HoloPanel({
    children,
    title,
    icon,
    variant = "default",
    size = "md",
    className = "",
    animate = true,
}: HoloPanelProps) {
    return (
        <motion.div
            className={`${styles.panel} ${styles[variant]} ${styles[size]} ${className}`}
            initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : undefined}
            animate={animate ? { opacity: 1, y: 0, scale: 1 } : undefined}
            transition={{ type: "spring" as const, bounce: 0.3, duration: 0.6 }}
        >
            {/* Corner decorations */}
            <div className={styles.cornerTL} />
            <div className={styles.cornerTR} />
            <div className={styles.cornerBL} />
            <div className={styles.cornerBR} />

            {/* Animated border */}
            <div className={styles.borderGlow} />

            {/* Scan line animation */}
            <div className={styles.scanLine} />

            {/* Header */}
            {title && (
                <div className={styles.header}>
                    {icon && <span className={styles.icon}>{icon}</span>}
                    <h3 className={styles.title}>{title}</h3>
                    <div className={styles.headerLine} />
                </div>
            )}

            {/* Content */}
            <div className={styles.content}>{children}</div>

            {/* Data stream decoration */}
            <div className={styles.dataStream}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.span
                        key={i}
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{
                            duration: 1.5,
                            delay: i * 0.2,
                            repeat: Infinity,
                        }}
                    >
                        {Math.random() > 0.5 ? "1" : "0"}
                    </motion.span>
                ))}
            </div>
        </motion.div>
    );
}
