"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./VictimCounter.module.css";

/**
 * VictimCounter Component
 * 
 * A dramatic odometer-style counter for displaying victim count.
 * Features glowing digits, subtle animations, and hexagonal design.
 */

interface VictimCounterProps {
    count: number;
    label?: string;
    className?: string;
}

export default function VictimCounter({
    count,
    label = "TARGETS ACQUIRED",
    className = "",
}: VictimCounterProps) {
    const [displayCount, setDisplayCount] = useState(count);
    const [isAnimating, setIsAnimating] = useState(false);

    // Animate count changes
    useEffect(() => {
        if (count !== displayCount) {
            setIsAnimating(true);

            // Smooth counting animation
            const diff = count - displayCount;
            const duration = Math.min(Math.abs(diff) * 50, 500);
            const steps = Math.min(Math.abs(diff), 20);
            const stepDuration = duration / steps;

            let current = displayCount;
            const increment = diff / steps;

            const timer = setInterval(() => {
                current += increment;
                if ((increment > 0 && current >= count) || (increment < 0 && current <= count)) {
                    setDisplayCount(count);
                    setIsAnimating(false);
                    clearInterval(timer);
                } else {
                    setDisplayCount(Math.round(current));
                }
            }, stepDuration);

            return () => clearInterval(timer);
        }
    }, [count, displayCount]);

    // Format number with leading zeros
    const digits = useMemo(() => {
        const str = displayCount.toString().padStart(4, "0");
        return str.split("");
    }, [displayCount]);

    return (
        <div className={`${styles.container} ${className}`}>
            {/* Background decoration */}
            <div className={styles.hexBackground}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={styles.hexRing} style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
            </div>

            {/* Main counter */}
            <div className={`${styles.counter} ${isAnimating ? styles.pulse : ""}`}>
                <AnimatePresence mode="popLayout">
                    {digits.map((digit, index) => (
                        <motion.div
                            key={`${index}-${digit}`}
                            className={styles.digitWrapper}
                            initial={{ y: -20, opacity: 0, scale: 0.8 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring" as const, bounce: 0.3, duration: 0.3 }}
                        >
                            <span className={styles.digit}>{digit}</span>
                            <div className={styles.digitGlow} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Label */}
            <div className={styles.label}>
                <span className={styles.labelText}>{label}</span>
                <motion.div
                    className={styles.statusDot}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.6, 1],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Decorative lines */}
            <div className={styles.decorLeft} />
            <div className={styles.decorRight} />
        </div>
    );
}
