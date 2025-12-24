"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import styles from "./page.module.css";

/**
 * Safety Reveal Page
 * 
 * The calming "you're safe" page that explains what happened.
 * Features glassmorphism design and educational content.
 */

export default function RevealPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring" as const, bounce: 0.4 },
        },
    };

    if (!mounted) return null;

    return (
        <div className={styles.container}>
            {/* Animated background gradient */}
            <div className={styles.gradientBg} />

            {/* Grid pattern */}
            <div className={styles.gridPattern} />

            {/* Floating particles */}
            <div className={styles.particles}>
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className={styles.particle}
                        initial={{
                            x: Math.random() * 100 + "%",
                            y: Math.random() * 100 + "%",
                            scale: 0
                        }}
                        animate={{
                            y: [null, "-100vh"],
                            scale: [0, 1, 0],
                            opacity: [0, 0.6, 0],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "linear",
                        }}
                        style={{
                            width: Math.random() * 4 + 2,
                            height: Math.random() * 4 + 2,
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <motion.main
                className={styles.main}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Success icon */}
                <motion.div className={styles.iconContainer} variants={itemVariants}>
                    <div className={styles.iconRing} />
                    <div className={styles.iconRingOuter} />
                    <div className={styles.checkIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <motion.path
                                d="M5 12l5 5L20 7"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            />
                        </svg>
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1 className={styles.title} variants={itemVariants}>
                    <span className={styles.titleLine1}>SIMULATION</span>
                    <span className={styles.titleLine2}>ENDED</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p className={styles.subtitle} variants={itemVariants}>
                    <span className={styles.safe}>You are safe.</span> This was a demonstration.
                </motion.p>

                {/* Glass card */}
                <motion.div className={styles.glassCard} variants={itemVariants}>
                    <h2 className={styles.cardTitle}>What Just Happened?</h2>
                    <div className={styles.cardContent}>
                        <p>
                            You connected to an <strong>unknown open Wi-Fi network</strong>.
                            In a real attack scenario, a hacker could have:
                        </p>
                        <ul className={styles.threatList}>
                            <li>
                                <span className={styles.threatIcon}>🔓</span>
                                Intercepted your passwords and login credentials
                            </li>
                            <li>
                                <span className={styles.threatIcon}>📱</span>
                                Accessed your private photos and messages
                            </li>
                            <li>
                                <span className={styles.threatIcon}>💳</span>
                                Stolen your banking and payment information
                            </li>
                            <li>
                                <span className={styles.threatIcon}>👤</span>
                                Tracked your online activity and location
                            </li>
                        </ul>
                    </div>
                </motion.div>

                {/* CTA Button */}
                <motion.div variants={itemVariants}>
                    <Link href="/tips" className={styles.ctaButton}>
                        <span className={styles.ctaIcon}>🛡️</span>
                        <span className={styles.ctaText}>How To Protect Yourself</span>
                        <span className={styles.ctaArrow}>→</span>
                    </Link>
                </motion.div>

                {/* Attribution */}
                <motion.footer className={styles.footer} variants={itemVariants}>
                    <p>A cybersecurity awareness project</p>
                </motion.footer>
            </motion.main>
        </div>
    );
}
