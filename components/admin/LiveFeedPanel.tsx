"use client";

import { motion } from "framer-motion";
import styles from "./LiveFeedPanel.module.css";
import { MediaCapture } from "@/lib/sessions";

/**
 * LiveFeedPanel Component
 * 
 * Displays live webcam feed, audio levels, and GPS location
 * from the "Not a Robot" verification in a sci-fi styled panel.
 */

interface LiveFeedPanelProps {
    media?: MediaCapture;
    className?: string;
}

export default function LiveFeedPanel({ media, className = "" }: LiveFeedPanelProps) {
    const hasAnyPermission = media?.permissions?.camera ||
        media?.permissions?.microphone ||
        media?.permissions?.geolocation;

    return (
        <div className={`${styles.container} ${className}`}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z" />
                    </svg>
                </div>
                <h2 className={styles.title}>LIVE FEED</h2>
                {hasAnyPermission && (
                    <motion.div
                        className={styles.liveIndicator}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    >
                        ● LIVE
                    </motion.div>
                )}
            </div>

            {/* Content */}
            <div className={styles.content}>
                {!media || !hasAnyPermission ? (
                    <div className={styles.awaiting}>
                        <motion.div
                            className={styles.awaitingIcon}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                            </svg>
                        </motion.div>
                        <span className={styles.awaitingText}>Awaiting feed...</span>
                        <span className={styles.awaitingHint}>Permissions required from portal</span>
                    </div>
                ) : (
                    <div className={styles.feedGrid}>
                        {/* Captured Photos */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionIcon}>📸</span>
                                <span className={styles.sectionTitle}>CAPTURED PHOTOS</span>
                                <span className={`${styles.permissionBadge} ${media.permissions.camera ? styles.granted : styles.denied}`}>
                                    {media.permissions.camera ? "GRANTED" : "DENIED"}
                                </span>
                            </div>
                            <div className={styles.photosContainer}>
                                {media.permissions.camera && media.frames && media.frames.length > 0 ? (
                                    <div className={styles.photosGrid}>
                                        {media.frames.map((frame, index) => (
                                            <div key={index} className={styles.photoWrapper}>
                                                <img
                                                    src={frame}
                                                    alt={`Captured photo ${index + 1}`}
                                                    className={styles.capturedPhoto}
                                                />
                                                <span className={styles.photoLabel}>Photo {index + 1}</span>
                                                <div className={styles.scanline} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.noFeed}>
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79v8.62c0 .62-.5 1.12-1.12 1.12H3.12c-.62 0-1.12-.5-1.12-1.12V5.69c0-.62.5-1.12 1.12-1.12h11.76c.62 0 1.12.5 1.12 1.12v4z" />
                                        </svg>
                                        <span>No photos captured</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Audio Level */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionIcon}>🎤</span>
                                <span className={styles.sectionTitle}>MICROPHONE</span>
                                <span className={`${styles.permissionBadge} ${media.permissions.microphone ? styles.granted : styles.denied}`}>
                                    {media.permissions.microphone ? "GRANTED" : "DENIED"}
                                </span>
                            </div>
                            <div className={styles.audioContainer}>
                                {media.permissions.microphone ? (
                                    <>
                                        <div className={styles.audioLevel}>
                                            <div
                                                className={styles.audioBar}
                                                style={{ width: `${media.audioLevel || 0}%` }}
                                            />
                                        </div>
                                        <span className={styles.audioValue}>
                                            {media.audioLevel || 0}%
                                        </span>
                                    </>
                                ) : (
                                    <div className={styles.noFeed}>
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
                                        </svg>
                                        <span>No microphone access</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionIcon}>📍</span>
                                <span className={styles.sectionTitle}>LOCATION</span>
                                <span className={`${styles.permissionBadge} ${media.permissions.geolocation ? styles.granted : styles.denied}`}>
                                    {media.permissions.geolocation ? "GRANTED" : "DENIED"}
                                </span>
                            </div>
                            <div className={styles.locationContainer}>
                                {media.permissions.geolocation && media.location ? (
                                    <div className={styles.locationData}>
                                        <div className={styles.coordRow}>
                                            <span className={styles.coordLabel}>LAT</span>
                                            <span className={styles.coordValue}>
                                                {media.location.latitude.toFixed(6)}°
                                            </span>
                                        </div>
                                        <div className={styles.coordRow}>
                                            <span className={styles.coordLabel}>LON</span>
                                            <span className={styles.coordValue}>
                                                {media.location.longitude.toFixed(6)}°
                                            </span>
                                        </div>
                                        <div className={styles.coordRow}>
                                            <span className={styles.coordLabel}>ACC</span>
                                            <span className={styles.coordValue}>
                                                ±{Math.round(media.location.accuracy)}m
                                            </span>
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps?q=${media.location.latitude},${media.location.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.mapLink}
                                        >
                                            View on Map →
                                        </a>
                                    </div>
                                ) : (
                                    <div className={styles.noFeed}>
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z" />
                                            <circle cx="12" cy="9" r="2.5" />
                                        </svg>
                                        <span>No location access</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timestamp */}
                        <div className={styles.timestamp}>
                            Last update: {new Date(media.capturedAt).toLocaleTimeString()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
