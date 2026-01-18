"use client";

import { motion, AnimatePresence } from "framer-motion";
import { VictimProfile } from "@/lib/sessions";
import styles from "./CurrentVictimPanel.module.css";

/**
 * CurrentVictimPanel Component
 * 
 * Displays comprehensive reconnaissance data for the current/most recent victim.
 * Sci-fi styled panel with real-time updates via SSE.
 */

interface CurrentVictimPanelProps {
    victim?: VictimProfile;
    className?: string;
}

export default function CurrentVictimPanel({
    victim,
    className = "",
}: CurrentVictimPanelProps) {

    if (!victim) {
        return (
            <div className={`${styles.panel} ${className}`}>
                <div className={styles.header}>
                    <div className={styles.headerIcon}>👁️</div>
                    <h2 className={styles.title}>CURRENT TARGET</h2>
                    <div className={styles.statusDot} data-status="inactive" />
                </div>
                <div className={styles.emptyState}>
                    <div className={styles.scanAnimation}>
                        <div className={styles.scanRing} />
                        <div className={styles.scanRing} />
                        <div className={styles.scanRing} />
                    </div>
                    <p>Awaiting target connection...</p>
                </div>
            </div>
        );
    }

    const formatTimestamp = (ts: string) => {
        const date = new Date(ts);
        return date.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <motion.div
            className={`${styles.panel} ${className}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerIcon}>👁️</div>
                <h2 className={styles.title}>CURRENT TARGET</h2>
                <div className={styles.statusDot} data-status="active" />
            </div>

            {/* Target ID */}
            <div className={styles.targetId}>
                <span className={styles.sessionLabel}>SESSION</span>
                <span className={styles.sessionId}>{victim.sessionId}</span>
            </div>

            <div className={styles.content}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={victim.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Identity Section */}
                        {(victim.name || victim.email || victim.phone) && (
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionIcon}>🎯</span>
                                    <span className={styles.sectionTitle}>IDENTITY</span>
                                </div>
                                <div className={styles.dataGrid}>
                                    {victim.name && (
                                        <div className={styles.dataRow}>
                                            <span className={styles.dataLabel}>Name</span>
                                            <span className={styles.dataValue}>{victim.name}</span>
                                        </div>
                                    )}
                                    {victim.email && (
                                        <div className={styles.dataRow}>
                                            <span className={styles.dataLabel}>Email</span>
                                            <span className={styles.dataValue}>{victim.email}</span>
                                        </div>
                                    )}
                                    {victim.phone && (
                                        <div className={styles.dataRow}>
                                            <span className={styles.dataLabel}>Phone</span>
                                            <span className={styles.dataValue}>+91 {victim.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Device Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionIcon}>📱</span>
                                <span className={styles.sectionTitle}>DEVICE</span>
                            </div>
                            <div className={styles.dataGrid}>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Type</span>
                                    <span className={styles.dataValue}>{victim.device.type}</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>OS</span>
                                    <span className={styles.dataValue}>{victim.device.os} {victim.device.osVersion}</span>
                                </div>
                                {victim.device.vendor !== 'Unknown' && (
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>Vendor</span>
                                        <span className={styles.dataValue}>{victim.device.vendor}</span>
                                    </div>
                                )}
                                {victim.device.model && (
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>Model</span>
                                        <span className={styles.dataValue}>{victim.device.model}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Browser Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionIcon}>🌐</span>
                                <span className={styles.sectionTitle}>BROWSER</span>
                            </div>
                            <div className={styles.dataGrid}>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Browser</span>
                                    <span className={styles.dataValue}>{victim.browser.name} {victim.browser.version}</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Engine</span>
                                    <span className={styles.dataValue}>{victim.browser.engine}</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Language</span>
                                    <span className={styles.dataValue}>{victim.browser.language}</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Platform</span>
                                    <span className={styles.dataValue}>{victim.browser.platform}</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Cookies</span>
                                    <span className={`${styles.dataValue} ${victim.browser.cookiesEnabled ? styles.enabled : styles.disabled}`}>
                                        {victim.browser.cookiesEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>DNT</span>
                                    <span className={`${styles.dataValue} ${victim.browser.doNotTrack ? styles.enabled : styles.disabled}`}>
                                        {victim.browser.doNotTrack ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Display Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionIcon}>🖥️</span>
                                <span className={styles.sectionTitle}>DISPLAY</span>
                            </div>
                            <div className={styles.dataGrid}>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Screen</span>
                                    <span className={styles.dataValue}>{victim.display.screenWidth}×{victim.display.screenHeight}</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Viewport</span>
                                    <span className={styles.dataValue}>{victim.display.viewportWidth}×{victim.display.viewportHeight}</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Color Depth</span>
                                    <span className={styles.dataValue}>{victim.display.colorDepth}-bit</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Pixel Ratio</span>
                                    <span className={styles.dataValue}>{victim.display.pixelRatio}x</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Orientation</span>
                                    <span className={styles.dataValue}>{victim.display.orientation}</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Touch</span>
                                    <span className={`${styles.dataValue} ${victim.display.touchSupport ? styles.enabled : styles.disabled}`}>
                                        {victim.display.touchSupport ? `Yes (${victim.display.maxTouchPoints} points)` : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Network Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionIcon}>📡</span>
                                <span className={styles.sectionTitle}>NETWORK</span>
                            </div>
                            <div className={styles.dataGrid}>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Connection</span>
                                    <span className={styles.dataValue}>{victim.network.connectionType || 'Unknown'}</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Effective</span>
                                    <span className={styles.dataValue}>{victim.network.effectiveType || 'Unknown'}</span>
                                </div>
                                {victim.network.downlink > 0 && (
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>Downlink</span>
                                        <span className={styles.dataValue}>{victim.network.downlink} Mbps</span>
                                    </div>
                                )}
                                {victim.network.rtt > 0 && (
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>RTT</span>
                                        <span className={styles.dataValue}>{victim.network.rtt} ms</span>
                                    </div>
                                )}
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Online</span>
                                    <span className={`${styles.dataValue} ${victim.network.onLine ? styles.enabled : styles.disabled}`}>
                                        {victim.network.onLine ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* IP Geolocation Section */}
                        {victim.ipGeo && (
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionIcon}>📍</span>
                                    <span className={styles.sectionTitle}>IP GEOLOCATION</span>
                                </div>
                                <div className={styles.dataGrid}>
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>IP</span>
                                        <span className={styles.dataValue}>{victim.ipGeo.ip}</span>
                                    </div>
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>Location</span>
                                        <span className={styles.dataValue}>{victim.ipGeo.city}, {victim.ipGeo.regionName}</span>
                                    </div>
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>Country</span>
                                        <span className={styles.dataValue}>{victim.ipGeo.country} ({victim.ipGeo.countryCode})</span>
                                    </div>
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>ISP</span>
                                        <span className={styles.dataValue}>{victim.ipGeo.isp}</span>
                                    </div>
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>Org</span>
                                        <span className={styles.dataValue}>{victim.ipGeo.org}</span>
                                    </div>
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>Timezone</span>
                                        <span className={styles.dataValue}>{victim.ipGeo.timezone}</span>
                                    </div>
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>Coordinates</span>
                                        <span className={styles.dataValue}>{victim.ipGeo.lat}, {victim.ipGeo.lon}</span>
                                    </div>
                                    {victim.ipGeo.proxy && (
                                        <div className={`${styles.dataRow} ${styles.warning}`}>
                                            <span className={styles.dataLabel}>⚠️ Proxy</span>
                                            <span className={styles.dataValue}>Detected</span>
                                        </div>
                                    )}
                                    {victim.ipGeo.hosting && (
                                        <div className={`${styles.dataRow} ${styles.warning}`}>
                                            <span className={styles.dataLabel}>⚠️ Hosting</span>
                                            <span className={styles.dataValue}>Detected</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Locale Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionIcon}>🌍</span>
                                <span className={styles.sectionTitle}>LOCALE</span>
                            </div>
                            <div className={styles.dataGrid}>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Timezone</span>
                                    <span className={styles.dataValue}>{victim.locale.timezone}</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>UTC Offset</span>
                                    <span className={styles.dataValue}>{victim.locale.timezoneOffset > 0 ? '-' : '+'}{Math.abs(victim.locale.timezoneOffset / 60)}h</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Language</span>
                                    <span className={styles.dataValue}>{victim.locale.language}</span>
                                </div>
                            </div>
                        </div>

                        {/* Hardware Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionIcon}>⚡</span>
                                <span className={styles.sectionTitle}>HARDWARE</span>
                            </div>
                            <div className={styles.dataGrid}>
                                {victim.hardware.cpuCores > 0 && (
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>CPU Cores</span>
                                        <span className={styles.dataValue}>{victim.hardware.cpuCores}</span>
                                    </div>
                                )}
                                {victim.hardware.deviceMemory > 0 && (
                                    <div className={styles.dataRow}>
                                        <span className={styles.dataLabel}>Memory</span>
                                        <span className={styles.dataValue}>{victim.hardware.deviceMemory} GB</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Capabilities Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionIcon}>🔧</span>
                                <span className={styles.sectionTitle}>CAPABILITIES</span>
                            </div>
                            <div className={styles.capabilitiesGrid}>
                                <span className={`${styles.capability} ${victim.capabilities.webGL ? styles.enabled : styles.disabled}`}>WebGL</span>
                                <span className={`${styles.capability} ${victim.capabilities.canvas ? styles.enabled : styles.disabled}`}>Canvas</span>
                                <span className={`${styles.capability} ${victim.capabilities.webRTC ? styles.enabled : styles.disabled}`}>WebRTC</span>
                                <span className={`${styles.capability} ${victim.capabilities.indexedDB ? styles.enabled : styles.disabled}`}>IndexedDB</span>
                                <span className={`${styles.capability} ${victim.capabilities.serviceWorker ? styles.enabled : styles.disabled}`}>ServiceWorker</span>
                                <span className={`${styles.capability} ${victim.capabilities.geolocation ? styles.enabled : styles.disabled}`}>Geolocation</span>
                                <span className={`${styles.capability} ${victim.capabilities.notifications ? styles.enabled : styles.disabled}`}>Notifications</span>
                            </div>
                            {victim.capabilities.webGL && victim.capabilities.webGLRenderer !== 'unknown' && (
                                <div className={styles.webglInfo}>
                                    <span className={styles.webglLabel}>GPU:</span>
                                    <span className={styles.webglValue}>{victim.capabilities.webGLRenderer}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer timestamp */}
            <div className={styles.footer}>
                <span className={styles.footerLabel}>Captured</span>
                <span className={styles.footerTime}>{formatTimestamp(victim.timestamp)}</span>
            </div>
        </motion.div>
    );
}
