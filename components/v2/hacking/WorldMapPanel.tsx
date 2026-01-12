"use client";

import { useEffect, useRef, useCallback } from "react";
import styles from "./WorldMapPanel.module.css";

/**
 * WorldMapPanel Component
 * 
 * Geographic attack visualization with animated scan beam,
 * target markers, and connection lines.
 */

interface WorldMapPanelProps {
    phase: "initializing" | "scanning" | "cracking" | "extracting" | "breach" | "complete";
    className?: string;
}

// Simplified world map path for SVG (outline of continents)
const WORLD_PATH = `
M 40,25 L 50,22 L 60,25 L 65,20 L 75,18 L 85,22 L 90,28 L 88,35 L 80,38 L 70,35 L 60,38 L 50,35 L 45,30 Z
M 20,40 L 28,38 L 35,42 L 30,55 L 22,60 L 15,55 L 18,45 Z
M 55,45 L 70,42 L 85,45 L 90,55 L 85,65 L 75,70 L 60,68 L 52,58 L 54,48 Z
M 130,35 L 145,30 L 155,35 L 160,45 L 155,55 L 145,58 L 135,55 L 130,45 Z
M 160,55 L 175,50 L 185,55 L 190,65 L 185,80 L 170,85 L 160,80 L 155,65 Z
`;

export function WorldMapPanel({ phase, className = "" }: WorldMapPanelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const scanPositionRef = useRef<number>(0);

    // Target locations (percentage-based)
    const targets = [
        { x: 25, y: 35, label: "NYC" },
        { x: 45, y: 30, label: "LON" },
        { x: 55, y: 55, label: "SAO" },
        { x: 75, y: 40, label: "MOS" },
        { x: 82, y: 60, label: "MUM" },
        { x: 92, y: 70, label: "SYD" },
    ];

    const animate = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
        ctx.clearRect(0, 0, width, height);

        const isActive = phase !== "complete";

        // Draw grid
        ctx.strokeStyle = "rgba(255, 26, 26, 0.1)";
        ctx.lineWidth = 0.5;

        // Latitude lines
        for (let i = 0; i <= 4; i++) {
            const y = (i / 4) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Longitude lines
        for (let i = 0; i <= 6; i++) {
            const x = (i / 6) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Draw map outline
        ctx.strokeStyle = "rgba(255, 51, 51, 0.4)";
        ctx.lineWidth = 1;

        // Simple continent shapes
        drawContinent(ctx, width * 0.15, height * 0.25, width * 0.15, height * 0.25); // North America
        drawContinent(ctx, width * 0.2, height * 0.55, width * 0.1, height * 0.3); // South America
        drawContinent(ctx, width * 0.4, height * 0.2, width * 0.15, height * 0.35); // Europe/Africa
        drawContinent(ctx, width * 0.55, height * 0.25, width * 0.25, height * 0.4); // Asia
        drawContinent(ctx, width * 0.8, height * 0.65, width * 0.12, height * 0.15); // Australia

        // Animated scan beam
        if (isActive) {
            scanPositionRef.current = (scanPositionRef.current + 2) % width;
            const scanX = scanPositionRef.current;

            const gradient = ctx.createLinearGradient(scanX - 50, 0, scanX + 50, 0);
            gradient.addColorStop(0, "rgba(255, 26, 26, 0)");
            gradient.addColorStop(0.3, "rgba(255, 51, 51, 0.2)");
            gradient.addColorStop(0.5, "rgba(255, 100, 100, 0.4)");
            gradient.addColorStop(0.7, "rgba(255, 51, 51, 0.2)");
            gradient.addColorStop(1, "rgba(255, 26, 26, 0)");

            ctx.fillStyle = gradient;
            ctx.fillRect(scanX - 50, 0, 100, height);

            // Scan line
            ctx.beginPath();
            ctx.strokeStyle = "rgba(255, 100, 100, 0.8)";
            ctx.lineWidth = 2;
            ctx.moveTo(scanX, 0);
            ctx.lineTo(scanX, height);
            ctx.stroke();
        }

        // Draw connection lines between targets
        ctx.strokeStyle = "rgba(255, 51, 51, 0.2)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        for (let i = 0; i < targets.length - 1; i++) {
            const from = targets[i];
            const to = targets[i + 1];

            ctx.beginPath();
            ctx.moveTo((from.x / 100) * width, (from.y / 100) * height);
            ctx.lineTo((to.x / 100) * width, (to.y / 100) * height);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Draw target markers
        targets.forEach((target, index) => {
            const x = (target.x / 100) * width;
            const y = (target.y / 100) * height;

            const pulse = Math.sin(time * 0.003 + index) * 0.5 + 0.5;
            const isScanned = phase !== "initializing" && scanPositionRef.current > x;

            // Outer pulse ring
            if (isActive) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 51, 51, ${0.2 + pulse * 0.3})`;
                ctx.lineWidth = 1;
                ctx.arc(x, y, 8 + pulse * 4, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Target dot
            ctx.beginPath();
            ctx.fillStyle = isScanned ? "rgba(255, 100, 100, 0.9)" : "rgba(255, 51, 51, 0.6)";
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();

            // Glow
            if (isScanned) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#ff5555";
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        animationRef.current = requestAnimationFrame((t) =>
            animate(ctx, width, height, t)
        );
    }, [phase, targets]);

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

        animationRef.current = requestAnimationFrame((t) =>
            animate(ctx, canvas.clientWidth, canvas.clientHeight, t)
        );

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [animate]);

    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.header}>
                <span className={styles.title}>GLOBAL SWEEP</span>
                <span className={styles.status}>
                    {phase === "scanning" ? "SCANNING" : phase === "complete" ? "COMPLETE" : "ACTIVE"}
                </span>
            </div>
            <canvas ref={canvasRef} className={styles.canvas} />
        </div>
    );
}

// Helper to draw simplified continent shapes
function drawContinent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.beginPath();

    // Organic blob shape
    const points = 8;
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radiusX = w * (0.4 + Math.random() * 0.2);
        const radiusY = h * (0.4 + Math.random() * 0.2);
        const px = x + Math.cos(angle) * radiusX;
        const py = y + Math.sin(angle) * radiusY;

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 26, 26, 0.05)";
    ctx.fill();
}

export default WorldMapPanel;
