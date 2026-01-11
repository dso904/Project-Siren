"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

/**
 * Digital Arrest Demonstration Page
 * 
 * Realistic simulation of Indian government Digital Arrest scam
 * for educational purposes. Shows how these scams appear to victims.
 */

// Generate fake case ID
const generateCaseId = () => {
    const prefix = "IT/ED/CBI";
    const year = new Date().getFullYear();
    const num = Math.floor(Math.random() * 900000 + 100000);
    return `${prefix}/${year}/${num}`;
};

// Format currency in Indian format
const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

export default function DigitalArrestPage() {
    const router = useRouter();
    const [caseId] = useState(generateCaseId());
    const [currentDate] = useState(new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }));
    const [countdown, setCountdown] = useState(300); // 5 minutes
    const [isLocked, setIsLocked] = useState(true);
    const [showWarning, setShowWarning] = useState(false);

    const fineAmount = 185000; // ₹1,85,000

    // Track visit
    useEffect(() => {
        const trackVisit = async () => {
            try {
                await fetch("/api/track", { method: "POST" });
            } catch (error) {
                console.error("Failed to track visit:", error);
            }
        };
        trackVisit();
    }, []);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 0) return 0;
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Show warning periodically
    useEffect(() => {
        const warningInterval = setInterval(() => {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 2000);
        }, 8000);
        return () => clearInterval(warningInterval);
    }, []);

    // Prevent back navigation
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 2000);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePayNow = () => {
        router.push('/digital-arrest/payment');
    };

    return (
        <div className={styles.container}>
            {/* Lock overlay effect */}
            <div className={styles.lockOverlay} />

            {/* Scanlines */}
            <div className={styles.scanlines} />

            {/* Warning flash */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div
                        className={styles.warningFlash}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        ⚠️ SYSTEM LOCKED - ESCAPE ATTEMPT DETECTED ⚠️
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <main className={styles.main}>
                {/* Government Header */}
                <motion.header
                    className={styles.header}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={styles.emblemContainer}>
                        <div className={styles.emblem}>🏛️</div>
                    </div>
                    <div className={styles.headerText}>
                        <h1 className={styles.govTitle}>भारत सरकार | GOVERNMENT OF INDIA</h1>
                        <h2 className={styles.deptTitle}>आयकर विभाग | INCOME TAX DEPARTMENT</h2>
                        <p className={styles.deptSubtitle}>Central Board of Direct Taxes | Ministry of Finance</p>
                    </div>
                    <div className={styles.emblemContainer}>
                        <div className={styles.emblem}>⚖️</div>
                    </div>
                </motion.header>

                {/* Alert Banner */}
                <motion.div
                    className={styles.alertBanner}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className={styles.alertIcon}>🔒</div>
                    <div className={styles.alertContent}>
                        <h3 className={styles.alertTitle}>DIGITAL ARREST NOTICE</h3>
                        <p className={styles.alertSubtitle}>Your device has been locked by Government of India</p>
                    </div>
                </motion.div>

                {/* Case Details */}
                <motion.section
                    className={styles.caseSection}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className={styles.caseHeader}>
                        <div className={styles.caseInfo}>
                            <span className={styles.caseLabel}>Case Reference No:</span>
                            <span className={styles.caseValue}>{caseId}</span>
                        </div>
                        <div className={styles.caseInfo}>
                            <span className={styles.caseLabel}>Date of Issue:</span>
                            <span className={styles.caseValue}>{currentDate}</span>
                        </div>
                    </div>

                    <div className={styles.chargesSection}>
                        <h4 className={styles.chargesTitle}>CHARGES FILED AGAINST YOU:</h4>
                        <ul className={styles.chargesList}>
                            <li>Violation of Section 276C of Income Tax Act, 1961 (Tax Evasion)</li>
                            <li>Suspicious financial transactions detected under PMLA, 2002</li>
                            <li>Non-disclosure of foreign assets under Black Money Act, 2015</li>
                            <li>Failure to comply with Section 139 (Filing of Returns)</li>
                        </ul>
                    </div>

                    <div className={styles.warningSection}>
                        <p className={styles.warningText}>
                            <strong>⚠️ IMPORTANT NOTICE:</strong> A thorough investigation by the Enforcement Directorate
                            and Income Tax Investigation Wing has revealed serious financial irregularities linked to
                            your PAN and Aadhaar. This constitutes a criminal offense under multiple sections of Indian law.
                        </p>
                        <p className={styles.warningText}>
                            As per the Digital India Security Protocol (DISP-2024), your device has been placed under
                            <strong> DIGITAL ARREST</strong>. You are hereby ordered to pay the penalty amount immediately
                            to avoid criminal prosecution, asset seizure, and potential imprisonment of up to 7 years.
                        </p>
                    </div>
                </motion.section>

                {/* Fine Section */}
                <motion.section
                    className={styles.fineSection}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                >
                    <div className={styles.fineHeader}>
                        <span className={styles.fineLabel}>PENALTY AMOUNT TO BE PAID:</span>
                    </div>
                    <div className={styles.fineAmount}>
                        {formatIndianCurrency(fineAmount)}
                    </div>
                    <div className={styles.fineNote}>
                        (One Lakh Eighty-Five Thousand Rupees Only)
                    </div>

                    {/* Countdown Timer */}
                    <div className={styles.timerSection}>
                        <div className={styles.timerLabel}>Time Remaining to Pay:</div>
                        <div className={`${styles.timerValue} ${countdown < 60 ? styles.timerCritical : ''}`}>
                            {formatTime(countdown)}
                        </div>
                        <div className={styles.timerWarning}>
                            Failure to pay will result in immediate FIR and arrest warrant
                        </div>
                    </div>
                </motion.section>

                {/* Pay Button */}
                <motion.button
                    className={styles.payButton}
                    onClick={handlePayNow}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className={styles.payIcon}>💳</span>
                    <span className={styles.payText}>PAY FINE NOW</span>
                    <div className={styles.payGlow} />
                </motion.button>

                {/* Footer */}
                <motion.footer
                    className={styles.footer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                >
                    <p className={styles.footerText}>
                        This is an official communication from the Government of India.
                        Tampering with this notice is a punishable offense under IT Act, 2000.
                    </p>
                    <p className={styles.footerContact}>
                        Helpline: 1800-XXX-XXXX | Email: enforcement@gov.in
                    </p>
                </motion.footer>
            </main>
        </div>
    );
}
