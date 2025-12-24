"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * MatrixRain Component
 * 
 * A high-performance canvas-based "Matrix Rain" / "Hex Dump" effect.
 * Uses requestAnimationFrame for smooth 60fps animation.
 * Automatically resizes to fill container.
 */

interface MatrixRainProps {
    /** Primary color for the rain characters */
    color?: string;
    /** Secondary highlight color for leading characters */
    highlightColor?: string;
    /** Character set to use */
    charset?: "matrix" | "hex" | "binary" | "mixed";
    /** Font size in pixels */
    fontSize?: number;
    /** Animation speed (characters per second) */
    speed?: number;
    /** Opacity of the fade trail */
    fadeOpacity?: number;
    /** Additional CSS classes */
    className?: string;
}

// Character sets for different modes
const CHARSETS = {
    matrix: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789",
    hex: "0123456789ABCDEF",
    binary: "01",
    mixed: "0123456789ABCDEFアイウエオカキクケコ!@#$%^&*()_+-=[]{}|;:,.<>?",
};

interface Column {
    x: number;
    y: number;
    speed: number;
    chars: string[];
    length: number;
}

export default function MatrixRain({
    color = "#00ff41",
    highlightColor = "#ffffff",
    charset = "mixed",
    fontSize = 14,
    speed = 1,
    fadeOpacity = 0.05,
    className = "",
}: MatrixRainProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const columnsRef = useRef<Column[]>([]);
    const animationRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    const chars = CHARSETS[charset];

    // Generate random character
    const getRandomChar = useCallback(() => {
        return chars[Math.floor(Math.random() * chars.length)];
    }, [chars]);

    // Initialize columns
    const initializeColumns = useCallback(
        (width: number, height: number) => {
            const columns: Column[] = [];
            const columnCount = Math.ceil(width / fontSize);

            for (let i = 0; i < columnCount; i++) {
                const length = Math.floor(Math.random() * 20) + 10;
                columns.push({
                    x: i * fontSize,
                    y: Math.random() * height - height,
                    speed: (Math.random() * 0.5 + 0.5) * speed,
                    length,
                    chars: Array.from({ length }, getRandomChar),
                });
            }

            columnsRef.current = columns;
        },
        [fontSize, speed, getRandomChar]
    );

    // Animation loop
    const animate = useCallback(
        (ctx: CanvasRenderingContext2D, width: number, height: number) => {
            const now = performance.now();
            const deltaTime = now - lastTimeRef.current;
            lastTimeRef.current = now;

            // Fade effect - creates the trailing effect
            ctx.fillStyle = `rgba(5, 5, 8, ${fadeOpacity})`;
            ctx.fillRect(0, 0, width, height);

            // Draw each column
            columnsRef.current.forEach((column) => {
                // Update column position
                column.y += column.speed * (deltaTime / 16);

                // Draw characters in the column
                column.chars.forEach((char, index) => {
                    const y = column.y + index * fontSize;

                    // Skip if outside canvas
                    if (y < -fontSize || y > height + fontSize) return;

                    // Calculate opacity based on position in column
                    const opacity = 1 - index / column.length;

                    if (index === 0) {
                        // Leading character - brightest
                        ctx.fillStyle = highlightColor;
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = highlightColor;
                    } else {
                        // Trailing characters - fade out
                        ctx.fillStyle = color;
                        ctx.globalAlpha = opacity * 0.8;
                        ctx.shadowBlur = 0;
                    }

                    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
                    ctx.fillText(char, column.x, y);
                    ctx.globalAlpha = 1;
                });

                // Reset column when it goes off screen
                if (column.y > height + column.length * fontSize) {
                    column.y = -column.length * fontSize;
                    column.speed = (Math.random() * 0.5 + 0.5) * speed;
                    column.chars = column.chars.map(() => getRandomChar());
                }

                // Randomly change characters for glitch effect
                if (Math.random() < 0.02) {
                    const charIndex = Math.floor(Math.random() * column.chars.length);
                    column.chars[charIndex] = getRandomChar();
                }
            });

            animationRef.current = requestAnimationFrame(() =>
                animate(ctx, width, height)
            );
        },
        [color, highlightColor, fontSize, speed, fadeOpacity, getRandomChar]
    );

    // Setup and resize handler
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

            initializeColumns(rect.width, rect.height);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        // Start animation
        lastTimeRef.current = performance.now();
        animate(ctx, canvas.width, canvas.height);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [animate, initializeColumns]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
            }}
        />
    );
}
