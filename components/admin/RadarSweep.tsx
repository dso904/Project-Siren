"use client";

import { useEffect, useRef } from "react";
import styles from "./RadarSweep.module.css";

/**
 * RadarSweep Component
 * 
 * An animated radar/sonar visualization with sweep effect,
 * grid lines, and pulsing ping indicators.
 * Inspired by military command center displays.
 */

interface RadarPing {
    x: number;
    y: number;
    age: number;
}

interface RadarSweepProps {
    /** Number of detected devices to show as pings */
    deviceCount?: number;
    /** Size of the radar in pixels */
    size?: number;
    /** Additional CSS classes */
    className?: string;
}

export default function RadarSweep({
    deviceCount = 0,
    size = 250,
    className = "",
}: RadarSweepProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pingsRef = useRef<RadarPing[]>([]);
    const angleRef = useRef(0);
    const animationRef = useRef<number>(0);

    // Generate pings based on device count
    useEffect(() => {
        const newPings: RadarPing[] = [];
        for (let i = 0; i < Math.min(deviceCount, 15); i++) {
            // Random position within radar circle
            const angle = Math.random() * Math.PI * 2;
            const distance = 0.3 + Math.random() * 0.6; // 30-90% from center
            newPings.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                age: 0,
            });
        }
        pingsRef.current = newPings;
    }, [deviceCount]);

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 10;

        const draw = () => {
            ctx.clearRect(0, 0, size, size);

            // Background with slight gradient
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            const bgGradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, radius
            );
            bgGradient.addColorStop(0, "rgba(0, 20, 30, 0.9)");
            bgGradient.addColorStop(1, "rgba(0, 10, 20, 0.95)");
            ctx.fillStyle = bgGradient;
            ctx.fill();

            // Grid circles
            ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
            ctx.lineWidth = 1;
            for (let i = 1; i <= 4; i++) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, (radius / 4) * i, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Grid cross lines
            ctx.beginPath();
            ctx.moveTo(centerX - radius, centerY);
            ctx.lineTo(centerX + radius, centerY);
            ctx.moveTo(centerX, centerY - radius);
            ctx.lineTo(centerX, centerY + radius);
            ctx.stroke();

            // Diagonal lines
            ctx.beginPath();
            const diag = radius * 0.707;
            ctx.moveTo(centerX - diag, centerY - diag);
            ctx.lineTo(centerX + diag, centerY + diag);
            ctx.moveTo(centerX + diag, centerY - diag);
            ctx.lineTo(centerX - diag, centerY + diag);
            ctx.stroke();

            // Sweep effect using multiple arcs with decreasing opacity
            const sweepAngle = angleRef.current;
            const sweepArcLength = Math.PI * 0.5; // 90 degree sweep
            const sweepSegments = 20;

            for (let i = 0; i < sweepSegments; i++) {
                const segmentStart = sweepAngle - (i * sweepArcLength / sweepSegments);
                const segmentEnd = sweepAngle - ((i + 1) * sweepArcLength / sweepSegments);
                const opacity = (1 - i / sweepSegments) * 0.4;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, segmentEnd, segmentStart);
                ctx.closePath();
                ctx.fillStyle = `rgba(0, 240, 255, ${opacity})`;
                ctx.fill();
            }

            // Sweep line (bright leading edge)
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(sweepAngle) * radius,
                centerY + Math.sin(sweepAngle) * radius
            );
            ctx.strokeStyle = "rgba(0, 240, 255, 0.9)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Glow on sweep line
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(sweepAngle) * radius,
                centerY + Math.sin(sweepAngle) * radius
            );
            ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
            ctx.lineWidth = 6;
            ctx.stroke();

            // Draw pings
            pingsRef.current.forEach((ping) => {
                const pingX = centerX + ping.x * radius;
                const pingY = centerY + ping.y * radius;

                // Calculate if ping was recently swept
                const pingAngle = Math.atan2(ping.y, ping.x);
                const angleDiff = (sweepAngle - pingAngle + Math.PI * 3) % (Math.PI * 2);

                if (angleDiff < 0.5) {
                    ping.age = 1;
                } else {
                    ping.age = Math.max(0, ping.age - 0.01);
                }

                if (ping.age > 0) {
                    // Ping glow
                    const pingGradient = ctx.createRadialGradient(
                        pingX, pingY, 0,
                        pingX, pingY, 15
                    );
                    pingGradient.addColorStop(0, `rgba(0, 255, 100, ${ping.age})`);
                    pingGradient.addColorStop(1, "rgba(0, 255, 100, 0)");
                    ctx.fillStyle = pingGradient;
                    ctx.beginPath();
                    ctx.arc(pingX, pingY, 15, 0, Math.PI * 2);
                    ctx.fill();

                    // Ping center dot
                    ctx.beginPath();
                    ctx.arc(pingX, pingY, 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(0, 255, 100, ${ping.age})`;
                    ctx.fill();
                }
            });

            // Center point
            ctx.beginPath();
            ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 240, 255, 0.8)";
            ctx.fill();

            // Outer ring glow
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Update angle
            angleRef.current += 0.02;
            if (angleRef.current > Math.PI * 2) {
                angleRef.current = 0;
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [size]);

    return (
        <div className={`${styles.container} ${className}`}>
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                style={{ width: size, height: size }}
            />
            <div className={styles.overlay}>
                <span className={styles.label}>NETWORK SCAN</span>
            </div>
        </div>
    );
}
