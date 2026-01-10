"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./HackerAgentAnimation.module.css";

/**
 * HackerAgentAnimation Component
 * 
 * Displays a cinematic hacking GIF animation with progress overlay
 * and dramatic ACCESS GRANTED reveal.
 */

interface HackerAgentAnimationProps {
    /** Duration of the hacking animation in seconds */
    duration?: number;
    /** Callback when hack is complete */
    onComplete?: () => void;
    /** Whether the animation is active */
    isActive?: boolean;
    /** Additional CSS classes */
    className?: string;
}

export default function HackerAgentAnimation({
    duration = 6,
    onComplete,
    isActive = true,
    className = "",
}: HackerAgentAnimationProps) {
    const [progress, setProgress] = useState(0);
    const [breached, setBreached] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const completedRef = useRef(false);

    // Main animation loop - just tracks progress for the overlay
    useEffect(() => {
        if (!isActive || completedRef.current) return;

        startTimeRef.current = Date.now();

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const currentProgress = Math.min(elapsed / (duration * 1000), 1);
            setProgress(currentProgress);

            // Complete animation
            if (currentProgress >= 1 && !completedRef.current) {
                completedRef.current = true;
                setBreached(true);

                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                
                // Delay callback for dramatic effect
                setTimeout(() => {
                    onComplete?.();
                }, 800);
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
            {/* GIF Background - the main visual */}
            <div className={styles.gifContainer}>
                <img 
                    src="/glitch.gif" 
                    alt="Hacking in progress" 
                    className={styles.hackingGif}
                />
            </div>

            {/* Subtle overlay with progress */}
            <div className={styles.overlay}>
                {/* Progress indicator at bottom */}
                <motion.div 
                    className={styles.progressSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className={`${styles.progressLabel} ${breached ? styles.success : ""}`}>
                        <span>{breached ? "BREACH COMPLETE" : "BRUTE FORCE ATTACK"}</span>
                        <span className={styles.progressValue}>{Math.round(progress * 100)}%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <motion.div
                            className={`${styles.progressFill} ${breached ? styles.success : ""}`}
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress * 100}%` }}
                            transition={{ duration: 0.1 }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* ACCESS GRANTED badge */}
            <AnimatePresence>
                {breached && (
                    <motion.div
                        className={styles.accessBadge}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", damping: 12 }}
                    >
                        ACCESS GRANTED
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
