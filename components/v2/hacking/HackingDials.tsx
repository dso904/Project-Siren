"use client";

import { useEffect, useRef, useCallback } from "react";
import styles from "./HackingDials.module.css";

/**
 * HackingDials Component
 * 
 * Dual concentric rotating lock mechanisms inspired by the reference image.
 * Features multiple ring layers rotating at different speeds,
 * with dramatic glow effects and breach animations.
 */

interface HackingDialsProps {
    phase: "initializing" | "scanning" | "cracking" | "extracting" | "breach" | "complete";
    progress: number;
    className?: string;
}

export function HackingDials({ phase, progress, className = "" }: HackingDialsProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const timeRef = useRef<number>(0);

    const animate = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        timeRef.current += 16; // ~60fps
        const time = timeRef.current;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const centerY = height / 2;
        const dialRadius = Math.min(width / 4.5, height / 2.2);
        const leftCenterX = width * 0.32;
        const rightCenterX = width * 0.68;

        // Determine animation intensity based on phase
        const isActive = phase === "cracking" || phase === "extracting";
        const isBreach = phase === "breach" || phase === "complete";
        const speedMultiplier = isActive ? 2 : isBreach ? 0.3 : 1;

        // Draw both dials
        drawDial(ctx, leftCenterX, centerY, dialRadius, time, speedMultiplier, progress, isBreach, false);
        drawDial(ctx, rightCenterX, centerY, dialRadius, time, speedMultiplier, progress, isBreach, true);

        // Center connection beam when breaching
        if (isBreach) {
            const beamGradient = ctx.createLinearGradient(leftCenterX + dialRadius, centerY, rightCenterX - dialRadius, centerY);
            beamGradient.addColorStop(0, "rgba(255, 51, 51, 0)");
            beamGradient.addColorStop(0.3, "rgba(255, 51, 51, 0.8)");
            beamGradient.addColorStop(0.5, "rgba(255, 150, 150, 1)");
            beamGradient.addColorStop(0.7, "rgba(255, 51, 51, 0.8)");
            beamGradient.addColorStop(1, "rgba(255, 51, 51, 0)");

            ctx.beginPath();
            ctx.strokeStyle = beamGradient;
            ctx.lineWidth = 4;
            ctx.moveTo(leftCenterX + dialRadius * 0.5, centerY);
            ctx.lineTo(rightCenterX - dialRadius * 0.5, centerY);
            ctx.stroke();

            // Glow effect
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#ff3333";
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        animationRef.current = requestAnimationFrame(() =>
            animate(ctx, width, height)
        );
    }, [phase, progress]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            ctx.scale(dpr, dpr);
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        animationRef.current = requestAnimationFrame(() =>
            animate(ctx, canvas.clientWidth, canvas.clientHeight)
        );

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [animate]);

    return (
        <div className={`${styles.container} ${className}`}>
            <canvas ref={canvasRef} className={styles.canvas} />

            {/* Status Labels */}
            <div className={styles.leftLabel}>
                <span className={styles.labelTitle}>ENCRYPTION</span>
                <span className={styles.labelValue}>{phase === "complete" ? "BYPASSED" : "ACTIVE"}</span>
            </div>
            <div className={styles.rightLabel}>
                <span className={styles.labelTitle}>FIREWALL</span>
                <span className={styles.labelValue}>{progress >= 50 ? "BREACHED" : "ACTIVE"}</span>
            </div>
        </div>
    );
}

// Helper function to draw a single dial
function drawDial(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    time: number,
    speedMultiplier: number,
    progress: number,
    isBreach: boolean,
    isReversed: boolean
) {
    const direction = isReversed ? -1 : 1;

    // Outer glow ring
    const glowGradient = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.2);
    glowGradient.addColorStop(0, "rgba(255, 26, 26, 0)");
    glowGradient.addColorStop(0.5, `rgba(255, 26, 26, ${isBreach ? 0.4 : 0.15})`);
    glowGradient.addColorStop(1, "rgba(255, 26, 26, 0)");

    ctx.beginPath();
    ctx.fillStyle = glowGradient;
    ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Multiple rotating rings
    const rings = [
        { radiusFactor: 1.0, segments: 32, thickness: 3, speed: 0.5, gap: 0.08 },
        { radiusFactor: 0.85, segments: 24, thickness: 4, speed: -0.8, gap: 0.1 },
        { radiusFactor: 0.7, segments: 16, thickness: 5, speed: 1.2, gap: 0.12 },
        { radiusFactor: 0.55, segments: 12, thickness: 3, speed: -0.6, gap: 0.15 },
        { radiusFactor: 0.4, segments: 8, thickness: 4, speed: 0.9, gap: 0.18 },
    ];

    rings.forEach((ring, ringIndex) => {
        const ringRadius = radius * ring.radiusFactor;
        const rotation = (time * 0.001 * ring.speed * speedMultiplier * direction) % (Math.PI * 2);
        const segmentAngle = (Math.PI * 2) / ring.segments;
        const gapAngle = segmentAngle * ring.gap;

        // Determine which segments are "unlocked" based on progress
        const unlockedSegments = Math.floor((progress / 100) * ring.segments);

        for (let i = 0; i < ring.segments; i++) {
            const startAngle = rotation + i * segmentAngle + gapAngle / 2;
            const endAngle = startAngle + segmentAngle - gapAngle;

            const isUnlocked = i < unlockedSegments;
            const alpha = isUnlocked ? 0.9 : 0.4;
            const color = isUnlocked
                ? `rgba(255, ${100 + ringIndex * 20}, ${100 + ringIndex * 20}, ${alpha})`
                : `rgba(255, 26, 26, ${alpha})`;

            ctx.beginPath();
            ctx.arc(cx, cy, ringRadius, startAngle, endAngle);
            ctx.strokeStyle = color;
            ctx.lineWidth = ring.thickness;
            ctx.lineCap = "round";
            ctx.stroke();

            // Add glow to unlocked segments
            if (isUnlocked) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#ff5555";
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
    });

    // Center core
    const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.25);
    coreGradient.addColorStop(0, isBreach ? "rgba(255, 100, 100, 0.9)" : "rgba(60, 20, 20, 0.9)");
    coreGradient.addColorStop(0.5, isBreach ? "rgba(255, 51, 51, 0.7)" : "rgba(40, 10, 10, 0.8)");
    coreGradient.addColorStop(1, "rgba(20, 5, 5, 0.9)");

    ctx.beginPath();
    ctx.fillStyle = coreGradient;
    ctx.arc(cx, cy, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Core border
    ctx.beginPath();
    ctx.strokeStyle = isBreach ? "rgba(255, 100, 100, 0.8)" : "rgba(255, 26, 26, 0.5)";
    ctx.lineWidth = 2;
    ctx.arc(cx, cy, radius * 0.25, 0, Math.PI * 2);
    ctx.stroke();

    // Inner rotating indicator
    const indicatorAngle = (time * 0.002 * speedMultiplier * direction) % (Math.PI * 2);
    const indicatorLength = radius * 0.2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
        cx + Math.cos(indicatorAngle) * indicatorLength,
        cy + Math.sin(indicatorAngle) * indicatorLength
    );
    ctx.strokeStyle = "rgba(255, 51, 51, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Outer frame ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.05, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 26, 26, 0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tick marks on outer ring
    const tickCount = 60;
    for (let i = 0; i < tickCount; i++) {
        const angle = (i / tickCount) * Math.PI * 2 - Math.PI / 2;
        const isLong = i % 5 === 0;
        const innerR = radius * (isLong ? 1.0 : 1.02);
        const outerR = radius * 1.05;

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx.strokeStyle = isLong ? "rgba(255, 51, 51, 0.6)" : "rgba(255, 26, 26, 0.3)";
        ctx.lineWidth = isLong ? 2 : 1;
        ctx.stroke();
    }
}

export default HackingDials;
