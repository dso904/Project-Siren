"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import styles from "./page.module.css";

/**
 * Protection Tips Page
 * 
 * Educational content with security recommendations.
 * Features animated cards with icons and descriptions.
 */

const TIPS = [
    {
        icon: "🔐",
        title: "Use a VPN",
        description: "A Virtual Private Network encrypts your traffic, making it unreadable to attackers even on public Wi-Fi.",
        color: "var(--safe-primary)",
    },
    {
        icon: "✅",
        title: "Verify Network Names",
        description: "Before connecting, confirm the network name with staff. Hackers create fake networks with similar names.",
        color: "var(--safe-secondary)",
    },
    {
        icon: "🔒",
        title: "Look for HTTPS",
        description: "Only enter sensitive information on websites with HTTPS (lock icon). Enable 'HTTPS-Only Mode' in your browser.",
        color: "var(--admin-primary)",
    },
    {
        icon: "📴",
        title: "Disable Auto-Connect",
        description: "Turn off automatic Wi-Fi connection in your settings to prevent your device from joining rogue networks.",
        color: "var(--attack-warning)",
    },
    {
        icon: "📱",
        title: "Use Mobile Data",
        description: "For banking, shopping, or entering passwords, use your mobile data instead of public Wi-Fi.",
        color: "var(--attack-tertiary)",
    },
    {
        icon: "🔄",
        title: "Keep Software Updated",
        description: "Updates patch security vulnerabilities. Enable automatic updates on all your devices.",
        color: "var(--safe-primary)",
    },
];

export default function TipsPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    } as const;

    const cardVariants = {
        hidden: { y: 30, opacity: 0, scale: 0.95 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring" as const, bounce: 0.4 },
        },
    };

    return (
        <div className={styles.container}>
            {/* Background */}
            <div className={styles.gradientBg} />
            <div className={styles.gridPattern} />

            <motion.main
                className={styles.main}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.header className={styles.header} variants={cardVariants}>
                    <div className={styles.headerIcon}>🛡️</div>
                    <h1 className={styles.title}>Protect Yourself</h1>
                    <p className={styles.subtitle}>
                        Follow these security best practices to stay safe online
                    </p>
                </motion.header>

                {/* Tips grid */}
                <motion.div className={styles.tipsGrid} variants={containerVariants}>
                    {TIPS.map((tip, index) => (
                        <motion.div
                            key={index}
                            className={styles.tipCard}
                            variants={cardVariants}
                            whileHover={{
                                scale: 1.02,
                                boxShadow: `0 0 30px ${tip.color}40`
                            }}
                            style={{ "--accent": tip.color } as React.CSSProperties}
                        >
                            <div className={styles.tipIcon}>{tip.icon}</div>
                            <h2 className={styles.tipTitle}>{tip.title}</h2>
                            <p className={styles.tipDescription}>{tip.description}</p>
                            <div className={styles.tipAccent} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Navigation */}
                <motion.nav className={styles.nav} variants={cardVariants}>
                    <Link href="/reveal" className={styles.navLink}>
                        ← Back to Safety Info
                    </Link>
                    <Link href="/credits" className={styles.navLinkPrimary}>
                        View Credits →
                    </Link>
                </motion.nav>
            </motion.main>
        </div>
    );
}
