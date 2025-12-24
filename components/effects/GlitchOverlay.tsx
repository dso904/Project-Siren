"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./GlitchOverlay.module.css";

/**
 * GlitchOverlay Component
 * 
 * Full-screen glitch effect used for dramatic transitions.
 * Combines RGB split, scanlines, and noise for cinematic effect.
 */

interface GlitchOverlayProps {
    /** Whether the glitch effect is active */
    isActive: boolean;
    /** Intensity of the glitch (0-1) */
    intensity?: number;
    /** Duration of the glitch in seconds */
    duration?: number;
    /** Callback when glitch is complete */
    onComplete?: () => void;
    /** Whether to include screen shake */
    shake?: boolean;
}

export default function GlitchOverlay({
    isActive,
    intensity = 0.8,
    duration = 2,
    onComplete,
    shake = true,
}: GlitchOverlayProps) {
    const [glitchPhase, setGlitchPhase] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setGlitchPhase(0);
            return;
        }

        // Escalating glitch phases
        const phases = [
            { delay: 0, phase: 1 },
            { delay: duration * 200, phase: 2 },
            { delay: duration * 400, phase: 3 },
            { delay: duration * 600, phase: 4 },
            { delay: duration * 800, phase: 5 },
            { delay: duration * 1000, phase: 0 },
        ];

        const timeouts: NodeJS.Timeout[] = [];

        phases.forEach(({ delay, phase }) => {
            const timeout = setTimeout(() => {
                setGlitchPhase(phase);
                if (phase === 0) {
                    onComplete?.();
                }
            }, delay);
            timeouts.push(timeout);
        });

        return () => timeouts.forEach(clearTimeout);
    }, [isActive, duration, onComplete]);

    return (
        <AnimatePresence>
            {isActive && glitchPhase > 0 && (
                <motion.div
                    className={`${styles.overlay} ${shake ? styles.shake : ""}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        "--intensity": intensity,
                        "--phase": glitchPhase,
                    } as React.CSSProperties}
                >
                    {/* RGB Split layer */}
                    <div className={styles.rgbSplit} />

                    {/* Scanlines */}
                    <div className={styles.scanlines} />

                    {/* Noise grain */}
                    <div className={styles.noise} />

                    {/* Horizontal glitch bars */}
                    <div className={styles.glitchBars}>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className={styles.bar}
                                initial={{ x: 0, opacity: 0 }}
                                animate={{
                                    x: [0, Math.random() * 100 - 50, 0],
                                    opacity: [0, 0.8, 0],
                                }}
                                transition={{
                                    duration: 0.2,
                                    delay: Math.random() * 0.5,
                                    repeat: Infinity,
                                    repeatDelay: Math.random() * 0.3,
                                }}
                                style={{
                                    top: `${i * 10 + Math.random() * 5}%`,
                                    height: `${Math.random() * 3 + 1}%`,
                                    background: `rgba(${Math.random() > 0.5 ? "255,0,100" : "0,255,255"}, 0.3)`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Flash overlay */}
                    <motion.div
                        className={styles.flash}
                        animate={{
                            opacity: [0, 0.5, 0, 0.3, 0],
                        }}
                        transition={{
                            duration: 0.3,
                            repeat: Infinity,
                            repeatDelay: 0.2,
                        }}
                    />

                    {/* Chromatic aberration text */}
                    <div className={styles.warningText}>
                        <span className={styles.textRed}>SYSTEM BREACH</span>
                        <span className={styles.textCyan}>SYSTEM BREACH</span>
                        <span className={styles.textMain}>SYSTEM BREACH</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
