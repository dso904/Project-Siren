"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./CredentialsList.module.css";

/**
 * CredentialsList Component
 * 
 * Displays list of "compromised" credentials with status indicators,
 * animated reveals, and realistic data.
 */

interface CredentialsListProps {
    phase: "initializing" | "scanning" | "cracking" | "extracting" | "breach" | "complete";
    className?: string;
}

interface Credential {
    id: string;
    user: string;
    password: string;
    status: "OFFLINE" | "ACTIVE" | "ERROR" | "CRACKED";
}

// Fake credentials to display
const CREDENTIALS: Credential[] = [
    { id: "0312", user: "USER#0312", password: "●●●●●●●●", status: "OFFLINE" },
    { id: "0675", user: "USER#0675", password: "●●●●●●●●", status: "ACTIVE" },
    { id: "1505", user: "USER#1505", password: "●●●●●●●●", status: "ACTIVE" },
    { id: "3305", user: "USER#3305", password: "●●●●●●●●", status: "ACTIVE" },
    { id: "0204", user: "USER#0204", password: "●●●●●●●●", status: "ERROR" },
    { id: "1004", user: "USER#1004", password: "●●●●●●●●", status: "ACTIVE" },
];

export function CredentialsList({ phase, className = "" }: CredentialsListProps) {
    const [visibleCount, setVisibleCount] = useState(0);
    const [credentials, setCredentials] = useState<Credential[]>([]);

    // Gradually reveal credentials based on phase
    useEffect(() => {
        let count = 0;
        switch (phase) {
            case "initializing": count = 1; break;
            case "scanning": count = 2; break;
            case "cracking": count = 4; break;
            case "extracting": count = 5; break;
            case "breach":
            case "complete": count = CREDENTIALS.length; break;
        }

        // Animate the count increase
        const interval = setInterval(() => {
            setVisibleCount(prev => {
                if (prev < count) return prev + 1;
                clearInterval(interval);
                return prev;
            });
        }, 500);

        return () => clearInterval(interval);
    }, [phase]);

    // Update credentials status when cracking/extracting
    useEffect(() => {
        const baseCredentials = CREDENTIALS.slice(0, visibleCount);

        if (phase === "extracting" || phase === "breach" || phase === "complete") {
            // Some become CRACKED
            const updated = baseCredentials.map((cred, i) => ({
                ...cred,
                status: i < Math.min(3, visibleCount) ? "CRACKED" as const : cred.status,
                password: i < Math.min(3, visibleCount) ? "p@ssw0rd!" : cred.password,
            }));
            setCredentials(updated);
        } else {
            setCredentials(baseCredentials);
        }
    }, [visibleCount, phase]);

    const getStatusColor = (status: Credential["status"]) => {
        switch (status) {
            case "ACTIVE": return styles.statusActive;
            case "CRACKED": return styles.statusCracked;
            case "ERROR": return styles.statusError;
            default: return styles.statusOffline;
        }
    };

    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.header}>
                <span className={styles.title}>CREDENTIALS</span>
                <span className={styles.count}>{credentials.length} FOUND</span>
            </div>

            <div className={styles.list}>
                <AnimatePresence>
                    {credentials.map((cred, index) => (
                        <motion.div
                            key={cred.id}
                            className={styles.entry}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <span className={styles.user}>{cred.user}</span>
                            <span className={styles.password}>{cred.password}</span>
                            <span className={`${styles.status} ${getStatusColor(cred.status)}`}>
                                status: {cred.status}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default CredentialsList;
