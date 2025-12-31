"use client";

import { motion } from "framer-motion";
import styles from "./DeviceChart.module.css";

/**
 * DeviceChart Component
 * 
 * A circular device breakdown chart with animated segments
 * and glowing effects. Shows iOS, Android, Desktop distribution.
 */

interface DeviceChartProps {
    data: {
        iOS: number;
        Android: number;
        Desktop: number;
        Unknown: number;
    };
    className?: string;
}

export default function DeviceChart({ data, className = "" }: DeviceChartProps) {
    const total = data.iOS + data.Android + data.Desktop + data.Unknown;

    const segments = [
        { label: "iOS", value: data.iOS, color: "#ff9500", icon: "📱" },
        { label: "Android", value: data.Android, color: "#00ff88", icon: "📲" },
        { label: "Desktop", value: data.Desktop, color: "#00f0ff", icon: "💻" },
        { label: "Unknown", value: data.Unknown, color: "#666666", icon: "❓" },
    ].filter((s) => s.value > 0);

    // Calculate percentages and angles
    let currentAngle = -90; // Start from top
    const segmentData = segments.map((segment) => {
        const percentage = total > 0 ? (segment.value / total) * 100 : 0;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;
        return { ...segment, percentage, startAngle, angle };
    });

    // SVG arc helper
    const createArc = (startAngle: number, endAngle: number, radius: number) => {
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const x1 = 100 + radius * Math.cos(startRad);
        const y1 = 100 + radius * Math.sin(startRad);
        const x2 = 100 + radius * Math.cos(endRad);
        const y2 = 100 + radius * Math.sin(endRad);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        return `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    return (
        <div className={`${styles.container} ${className}`}>
            {/* Chart SVG */}
            <div className={styles.chartWrapper}>
                <svg viewBox="0 0 200 200" className={styles.chart}>
                    {/* Background circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r="75"
                        fill="rgba(0, 10, 20, 0.5)"
                        stroke="rgba(0, 240, 255, 0.2)"
                        strokeWidth="1"
                    />

                    {/* Segments */}
                    {segmentData.map((segment, index) => (
                        <motion.path
                            key={segment.label}
                            d={createArc(segment.startAngle, segment.startAngle + segment.angle, 70)}
                            fill={segment.color}
                            fillOpacity={0.7}
                            stroke={segment.color}
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            style={{
                                filter: `drop-shadow(0 0 10px ${segment.color})`,
                                transformOrigin: "center",
                            }}
                        />
                    ))}

                    {/* Center circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r="40"
                        fill="rgba(5, 5, 15, 0.9)"
                        stroke="rgba(0, 240, 255, 0.3)"
                        strokeWidth="1"
                    />

                    {/* Center text */}
                    <text
                        x="100"
                        y="95"
                        textAnchor="middle"
                        className={styles.totalNumber}
                        fill="white"
                        suppressHydrationWarning
                    >
                        {total}
                    </text>
                    <text
                        x="100"
                        y="115"
                        textAnchor="middle"
                        className={styles.totalLabel}
                        fill="rgba(255,255,255,0.5)"
                    >
                        TOTAL
                    </text>
                </svg>

                {/* Rotating ring */}
                <div className={styles.rotatingRing} />
            </div>

            {/* Legend */}
            <div className={styles.legend}>
                {segmentData.map((segment) => (
                    <motion.div
                        key={segment.label}
                        className={styles.legendItem}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <span
                            className={styles.legendDot}
                            style={{
                                background: segment.color,
                                boxShadow: `0 0 10px ${segment.color}`,
                            }}
                        />
                        <span className={styles.legendIcon}>{segment.icon}</span>
                        <span className={styles.legendLabel}>{segment.label}</span>
                        <span className={styles.legendValue}>{segment.value}</span>
                        <span className={styles.legendPercent}>
                            {segment.percentage.toFixed(0)}%
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
