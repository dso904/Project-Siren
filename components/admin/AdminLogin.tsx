"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./login.module.css";

/**
 * Admin Login Component
 * 
 * Futuristic authentication screen with hardcoded credentials.
 * Username: admin
 * Password: SPHS1234
 */

interface AdminLoginProps {
    onAuthenticated: () => void;
}

export default function AdminLogin({ onAuthenticated }: AdminLoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [glitchActive, setGlitchActive] = useState(false);
    const [hexCodes, setHexCodes] = useState<string[]>([]);

    // Generate random hex codes for decoration
    useEffect(() => {
        const codes = Array.from({ length: 8 }, () =>
            Math.random().toString(16).substring(2, 8).toUpperCase()
        );
        setHexCodes(codes);
    }, []);

    // Periodic glitch effect
    useEffect(() => {
        const interval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 150);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Simulate authentication delay for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Hardcoded credentials check
        if (username === "admin" && password === "SPHS1234") {
            // Success - trigger glitch and authenticate
            setGlitchActive(true);
            setTimeout(() => {
                onAuthenticated();
            }, 500);
        } else {
            setError("ACCESS DENIED - Invalid credentials");
            setIsLoading(false);
            // Shake effect on error
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 300);
        }
    };

    return (
        <div className={styles.container}>
            {/* Scanlines overlay */}
            <div className={styles.scanlines} />

            {/* Animated background hex codes */}
            <div className={styles.hexBackground}>
                {hexCodes.map((code, i) => (
                    <motion.div
                        key={i}
                        className={styles.hexCode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: [0.1, 0.3, 0.1],
                            y: [20, -20, 20]
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            delay: i * 0.5
                        }}
                        style={{
                            left: `${10 + (i * 12)}%`,
                            top: `${20 + (i % 3) * 25}%`
                        }}
                    >
                        0x{code}
                    </motion.div>
                ))}
            </div>

            {/* Main login panel */}
            <motion.div
                className={`${styles.loginPanel} ${glitchActive ? styles.glitch : ""}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
            >
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h1 className={styles.title}>
                        <span className={styles.glitchText} data-text="SECURE ACCESS">
                            SECURE ACCESS
                        </span>
                    </h1>
                    <p className={styles.subtitle}>AUTHORIZATION REQUIRED</p>
                </div>

                {/* Terminal-style decoration */}
                <div className={styles.terminalDecor}>
                    <span className={styles.terminalLine}>root@siren:~$ authenticate --admin</span>
                    <span className={styles.terminalCursor}>▊</span>
                </div>

                {/* Login form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            <span className={styles.labelIcon}>▸</span>
                            USER_ID
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={styles.input}
                                placeholder="Enter username..."
                                autoComplete="off"
                                spellCheck={false}
                            />
                            <div className={styles.inputGlow} />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            <span className={styles.labelIcon}>▸</span>
                            ACCESS_KEY
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                placeholder="Enter password..."
                                autoComplete="off"
                            />
                            <div className={styles.inputGlow} />
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <motion.div
                            className={styles.error}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <span className={styles.errorIcon}>⚠</span>
                            {error}
                        </motion.div>
                    )}

                    {/* Submit button */}
                    <motion.button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? (
                            <span className={styles.loadingText}>
                                <span className={styles.loadingDot}>●</span>
                                AUTHENTICATING
                                <span className={styles.loadingDots}>...</span>
                            </span>
                        ) : (
                            <>
                                <span className={styles.btnIcon}>⎆</span>
                                INITIALIZE ACCESS
                            </>
                        )}
                        <div className={styles.btnGlow} />
                    </motion.button>
                </form>

                {/* Footer decoration */}
                <div className={styles.footer}>
                    <div className={styles.footerLine} />
                    <span className={styles.footerText}>PROJECT SIREN v1.0</span>
                    <div className={styles.footerLine} />
                </div>
            </motion.div>

            {/* Corner decorations */}
            <div className={styles.cornerTL} />
            <div className={styles.cornerTR} />
            <div className={styles.cornerBL} />
            <div className={styles.cornerBR} />
        </div>
    );
}
