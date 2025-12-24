"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./LockCrack.module.css";

/**
 * LockCrack Component
 * 
 * Animated SVG padlock with spinning number dials simulating brute-force attack.
 * Uses Framer Motion for smooth animations and CSS for glow effects.
 */

interface LockCrackProps {
    /** Duration of the cracking animation in seconds */
    duration?: number;
    /** Callback when crack is complete */
    onComplete?: () => void;
    /** Whether to show the cracking animation */
    isActive?: boolean;
    /** Additional CSS classes */
    className?: string;
}

export default function LockCrack({
    duration = 6,
    onComplete,
    isActive = true,
    className = "",
}: LockCrackProps) {
    const [digits, setDigits] = useState<string[]>(["0", "0", "0", "0"]);
    const [cracked, setCracked] = useState(false);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        if (!isActive) return;

        startTimeRef.current = Date.now();

        // Spin digits randomly
        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const currentProgress = Math.min(elapsed / (duration * 1000), 1);
            setProgress(currentProgress);

            // Gradually lock in digits as progress increases
            setDigits((prev) =>
                prev.map((_, index) => {
                    const lockThreshold = (index + 1) * 0.25;
                    if (currentProgress >= lockThreshold) {
                        // Lock this digit
                        return ["7", "3", "8", "1"][index];
                    }
                    // Random spinning digit
                    return Math.floor(Math.random() * 10).toString();
                })
            );

            if (currentProgress >= 1) {
                setCracked(true);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                onComplete?.();
            }
        }, 50);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, duration, onComplete]);

    return (
        <div className={`${styles.container} ${className}`}>
            {/* Animated glow rings */}
            <div className={styles.glowRings}>
                <motion.div
                    className={styles.ring}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className={styles.ringInner}
                    animate={{
                        scale: [1.1, 0.9, 1.1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Lock SVG */}
            <motion.div
                className={styles.lockContainer}
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                    scale: 1,
                    rotate: 0,
                    filter: cracked
                        ? "drop-shadow(0 0 30px #00ff41)"
                        : "drop-shadow(0 0 20px #ff073a)"
                }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            >
                <svg
                    viewBox="0 0 100 120"
                    className={styles.lockSvg}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Lock shackle */}
                    <motion.path
                        d="M25 50 V30 C25 15 40 5 50 5 C60 5 75 15 75 30 V50"
                        stroke={cracked ? "#00ff41" : "#ff073a"}
                        strokeWidth="6"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{
                            pathLength: 1,
                            y: cracked ? -10 : 0,
                            rotate: cracked ? 20 : 0,
                        }}
                        transition={{ duration: 1, delay: 0.3 }}
                        style={{ transformOrigin: "75px 40px" }}
                    />

                    {/* Lock body */}
                    <motion.rect
                        x="15"
                        y="50"
                        width="70"
                        height="55"
                        rx="8"
                        fill={cracked ? "#00ff41" : "#ff073a"}
                        fillOpacity="0.2"
                        stroke={cracked ? "#00ff41" : "#ff073a"}
                        strokeWidth="3"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    />

                    {/* Keyhole */}
                    <motion.circle
                        cx="50"
                        cy="72"
                        r="8"
                        fill={cracked ? "#00ff41" : "#ff073a"}
                        initial={{ scale: 0 }}
                        animate={{
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 0.7,
                            repeat: cracked ? 0 : Infinity,
                            repeatDelay: 0.5,
                        }}
                    />
                    <motion.rect
                        x="46"
                        y="75"
                        width="8"
                        height="15"
                        rx="2"
                        fill={cracked ? "#00ff41" : "#ff073a"}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.3, delay: 0.9 }}
                    />
                </svg>
            </motion.div>

            {/* Spinning digit display */}
            <div className={styles.digitContainer}>
                {digits.map((digit, index) => (
                    <motion.div
                        key={index}
                        className={`${styles.digit} ${progress >= (index + 1) * 0.25 ? styles.locked : ""
                            }`}
                        animate={{
                            y: progress >= (index + 1) * 0.25 ? 0 : [0, -5, 5, 0],
                            color: progress >= (index + 1) * 0.25 ? "#00ff41" : "#ff073a",
                        }}
                        transition={{
                            y: { duration: 0.1, repeat: Infinity },
                            color: { duration: 0.2 },
                        }}
                    >
                        {digit}
                    </motion.div>
                ))}
            </div>

            {/* Progress bar */}
            <div className={styles.progressContainer}>
                <div className={styles.progressLabel}>
                    BRUTE FORCE: {Math.round(progress * 100)}%
                </div>
                <div className={styles.progressBar}>
                    <motion.div
                        className={styles.progressFill}
                        initial={{ width: "0%" }}
                        animate={{
                            width: `${progress * 100}%`,
                            backgroundColor: cracked ? "#00ff41" : "#ff073a",
                        }}
                        transition={{ duration: 0.1 }}
                    />
                </div>
            </div>

            {/* Cracked indicator */}
            <AnimatePresence>
                {cracked && (
                    <motion.div
                        className={styles.crackedBadge}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                    >
                        ACCESS GRANTED
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
