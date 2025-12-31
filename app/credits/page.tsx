"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./page.module.css";

/**
 * Credits Page
 * 
 * Team attribution and project information.
 * Placeholder for team member details.
 */

// Team Hackminors - South Point High School, Kolkata
const TEAM_MEMBERS = [
    {
        name: "Purbayon Sarkar",
        role: "Class XI K Afternoon",
        avatar: "👨‍💻",
    },
    {
        name: "Sagnik Chakraborty",
        role: "Class XI J Afternoon",
        avatar: "🔐",
    },
    {
        name: "Hrishikesh Saha",
        role: "Class XI J Afternoon",
        avatar: "🎨",
    },
];

export default function CreditsPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
            },
        },
    } as const;

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring" as const, bounce: 0.4 },
        },
    };

    return (
        <div className={styles.container}>
            {/* Background */}
            <div className={styles.gradientBg} />

            {/* Animated grid */}
            <div className={styles.animatedGrid}>
                {Array.from({ length: 50 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className={styles.gridDot}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.1, 0.4, 0.1] }}
                        transition={{
                            duration: 3,
                            delay: Math.random() * 2,
                            repeat: Infinity,
                        }}
                    />
                ))}
            </div>

            <motion.main
                className={styles.main}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Project title */}
                <motion.header className={styles.header} variants={itemVariants}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>🎯</span>
                        <h1 className={styles.projectName}>
                            <span className={styles.projectPrefix}>PROJECT</span>
                            <span className={styles.projectTitle}>SIREN</span>
                        </h1>
                    </div>
                    <p className={styles.tagline}>Safe Honeypot for Cybersecurity Awareness</p>
                </motion.header>

                {/* Divider */}
                <motion.div className={styles.divider} variants={itemVariants}>
                    <span>THE TEAM</span>
                </motion.div>

                {/* Team grid */}
                <motion.div className={styles.teamGrid} variants={containerVariants}>
                    {TEAM_MEMBERS.map((member, index) => (
                        <motion.div
                            key={index}
                            className={styles.memberCard}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -5 }}
                        >
                            <div className={styles.memberAvatar}>{member.avatar}</div>
                            <h3 className={styles.memberName}>{member.name}</h3>
                            <p className={styles.memberRole}>{member.role}</p>
                            <div className={styles.memberGlow} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Technologies */}
                <motion.section className={styles.techSection} variants={itemVariants}>
                    <h2 className={styles.sectionTitle}>Built With</h2>
                    <div className={styles.techList}>
                        <span className={styles.techBadge}>Next.js</span>
                        <span className={styles.techBadge}>React</span>
                        <span className={styles.techBadge}>TypeScript</span>
                        <span className={styles.techBadge}>GSAP</span>
                        <span className={styles.techBadge}>Framer Motion</span>
                    </div>
                </motion.section>

                {/* Footer */}
                <motion.footer className={styles.footer} variants={itemVariants}>
                    <p className={styles.exhibitionNote}>
                        Team Hackminors • South Point High School, Kolkata • 2025
                    </p>
                    <Link href="/" className={styles.restartLink}>
                        ↺ Experience Demo Again
                    </Link>
                </motion.footer>
            </motion.main>
        </div>
    );
}
