"use client";

import { useEffect, useRef, useCallback } from "react";
import styles from "./TacticalGrid.module.css";

/**
 * TacticalGrid Component
 * 
 * A perspective-transformed grid overlay that creates
 * depth and a futuristic tactical display aesthetic.
 * Features animated grid lines with pulse effects.
 */

interface TacticalGridProps {
    className?: string;
}

export function TacticalGrid({ className = "" }: TacticalGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    const animate = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const gridSize = 50;
        const cols = Math.ceil(width / gridSize) + 1;
        const rows = Math.ceil(height / gridSize) + 1;

        // Pulse effect
        const pulse = Math.sin(time * 0.001) * 0.5 + 0.5;
        const baseAlpha = 0.08 + pulse * 0.04;

        // Vertical lines
        ctx.strokeStyle = `rgba(255, 26, 26, ${baseAlpha})`;
        ctx.lineWidth = 0.5;

        for (let i = 0; i <= cols; i++) {
            const x = i * gridSize;

            // Highlight every 5th line
            if (i % 5 === 0) {
                ctx.strokeStyle = `rgba(255, 26, 26, ${baseAlpha * 2})`;
                ctx.lineWidth = 1;
            } else {
                ctx.strokeStyle = `rgba(255, 26, 26, ${baseAlpha})`;
                ctx.lineWidth = 0.5;
            }

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= rows; i++) {
            const y = i * gridSize;

            // Highlight every 5th line
            if (i % 5 === 0) {
                ctx.strokeStyle = `rgba(255, 26, 26, ${baseAlpha * 2})`;
                ctx.lineWidth = 1;
            } else {
                ctx.strokeStyle = `rgba(255, 26, 26, ${baseAlpha})`;
                ctx.lineWidth = 0.5;
            }

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Animated scan line
        const scanY = (time * 0.05) % height;
        const scanGradient = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
        scanGradient.addColorStop(0, "rgba(255, 26, 26, 0)");
        scanGradient.addColorStop(0.5, "rgba(255, 51, 51, 0.15)");
        scanGradient.addColorStop(1, "rgba(255, 26, 26, 0)");

        ctx.fillStyle = scanGradient;
        ctx.fillRect(0, scanY - 30, width, 60);

        // Corner markers
        const cornerSize = 30;
        const cornerThickness = 2;
        ctx.strokeStyle = `rgba(255, 51, 51, ${0.4 + pulse * 0.2})`;
        ctx.lineWidth = cornerThickness;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(0, cornerSize);
        ctx.lineTo(0, 0);
        ctx.lineTo(cornerSize, 0);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(width - cornerSize, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, cornerSize);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(0, height - cornerSize);
        ctx.lineTo(0, height);
        ctx.lineTo(cornerSize, height);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(width - cornerSize, height);
        ctx.lineTo(width, height);
        ctx.lineTo(width, height - cornerSize);
        ctx.stroke();

        animationRef.current = requestAnimationFrame((t) =>
            animate(ctx, width, height, t)
        );
    }, []);

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
            animate(ctx, canvas.width, canvas.height, t)
        );

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [animate]);

    return (
        <canvas
            ref={canvasRef}
            className={`${styles.canvas} ${className}`}
        />
    );
}

export default TacticalGrid;
