"use client";

import { useEffect, useRef, useCallback } from "react";
import styles from "./RadarSweep.module.css";

/**
 * RadarSweep Component
 * 
 * Classic rotating radar display with sweep animation
 * and random target blips.
 */

interface RadarSweepProps {
    active?: boolean;
    className?: string;
}

export function RadarSweep({ active = true, className = "" }: RadarSweepProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const angleRef = useRef<number>(0);
    const blipsRef = useRef<{ x: number; y: number; age: number; maxAge: number }[]>([]);

    const animate = useCallback((ctx: CanvasRenderingContext2D, size: number, time: number) => {
        ctx.clearRect(0, 0, size, size);

        const cx = size / 2;
        const cy = size / 2;
        const radius = size * 0.45;

        // Update sweep angle
        if (active) {
            angleRef.current = (angleRef.current + 0.02) % (Math.PI * 2);
        }

        // Background
        ctx.fillStyle = "rgba(10, 5, 5, 0.9)";
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Concentric rings
        for (let i = 1; i <= 4; i++) {
            ctx.beginPath();
            ctx.arc(cx, cy, (radius / 4) * i, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 26, 26, ${0.15 + (i === 4 ? 0.1 : 0)})`;
            ctx.lineWidth = i === 4 ? 2 : 1;
            ctx.stroke();
        }

        // Cross lines
        ctx.strokeStyle = "rgba(255, 26, 26, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - radius, cy);
        ctx.lineTo(cx + radius, cy);
        ctx.moveTo(cx, cy - radius);
        ctx.lineTo(cx, cy + radius);
        ctx.stroke();

        // Sweep gradient
        if (active) {
            const sweepGradient = ctx.createConicGradient(angleRef.current, cx, cy);
            sweepGradient.addColorStop(0, "rgba(255, 51, 51, 0.4)");
            sweepGradient.addColorStop(0.1, "rgba(255, 26, 26, 0.1)");
            sweepGradient.addColorStop(0.2, "rgba(255, 26, 26, 0)");
            sweepGradient.addColorStop(1, "rgba(255, 26, 26, 0)");

            ctx.beginPath();
            ctx.fillStyle = sweepGradient;
            ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
            ctx.fill();

            // Sweep line
            const sweepX = cx + Math.cos(angleRef.current) * radius;
            const sweepY = cy + Math.sin(angleRef.current) * radius;

            ctx.beginPath();
            ctx.strokeStyle = "rgba(255, 100, 100, 0.8)";
            ctx.lineWidth = 2;
            ctx.moveTo(cx, cy);
            ctx.lineTo(sweepX, sweepY);
            ctx.stroke();

            // Add new blips randomly
            if (Math.random() < 0.02) {
                const blipAngle = Math.random() * Math.PI * 2;
                const blipDist = Math.random() * radius * 0.8 + radius * 0.1;
                blipsRef.current.push({
                    x: cx + Math.cos(blipAngle) * blipDist,
                    y: cy + Math.sin(blipAngle) * blipDist,
                    age: 0,
                    maxAge: 100 + Math.random() * 100,
                });
            }
        }

        // Draw and update blips
        blipsRef.current = blipsRef.current.filter(blip => {
            blip.age++;
            if (blip.age > blip.maxAge) return false;

            const alpha = 1 - blip.age / blip.maxAge;

            // Blip dot
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 100, 100, ${alpha})`;
            ctx.arc(blip.x, blip.y, 3, 0, Math.PI * 2);
            ctx.fill();

            // Blip glow
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 51, 51, ${alpha * 0.3})`;
            ctx.arc(blip.x, blip.y, 6, 0, Math.PI * 2);
            ctx.fill();

            return true;
        });

        // Center dot
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 100, 100, 0.8)";
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();

        animationRef.current = requestAnimationFrame(() =>
            animate(ctx, size, time + 16)
        );
    }, [active]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            const size = Math.min(rect.width, rect.height);

            canvas.width = size * dpr;
            canvas.height = size * dpr;

            ctx.scale(dpr, dpr);
            canvas.style.width = `${size}px`;
            canvas.style.height = `${size}px`;
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        animationRef.current = requestAnimationFrame(() =>
            animate(ctx, Math.min(canvas.clientWidth, canvas.clientHeight), 0)
        );

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [animate]);

    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.header}>
                <span className={styles.title}>RADAR</span>
            </div>
            <div className={styles.canvasWrapper}>
                <canvas ref={canvasRef} className={styles.canvas} />
            </div>
        </div>
    );
}

export default RadarSweep;
