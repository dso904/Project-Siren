"use client";

import { useEffect, useRef, useCallback } from "react";
import styles from "./NeuralNetwork.module.css";

/**
 * NeuralNetwork Component
 * 
 * A sophisticated canvas-based neural network visualization
 * with pulsing nodes, animated connections, and depth effects.
 * Creates an organic, living background layer.
 */

interface NeuralNetworkProps {
    intensity?: number; // 0-1, controls visibility and activity
    nodeCount?: number;
    className?: string;
}

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    pulsePhase: number;
    connections: number[];
}

export function NeuralNetwork({
    intensity = 0.5,
    nodeCount = 60,
    className = "",
}: NeuralNetworkProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<Node[]>([]);
    const animationRef = useRef<number>(0);

    // Initialize nodes
    const initializeNodes = useCallback((width: number, height: number) => {
        const nodes: Node[] = [];

        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 2 + 1,
                pulsePhase: Math.random() * Math.PI * 2,
                connections: [],
            });
        }

        // Pre-calculate potential connections (closest neighbors)
        nodes.forEach((node, i) => {
            const distances: { index: number; dist: number }[] = [];
            nodes.forEach((other, j) => {
                if (i !== j) {
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    distances.push({ index: j, dist: Math.sqrt(dx * dx + dy * dy) });
                }
            });
            distances.sort((a, b) => a.dist - b.dist);
            node.connections = distances.slice(0, 4).map(d => d.index);
        });

        nodesRef.current = nodes;
    }, [nodeCount]);

    // Animation loop
    const animate = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
        // Clear with fade effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, width, height);

        const nodes = nodesRef.current;
        const maxDist = 150;
        const baseAlpha = intensity * 0.4;

        // Update node positions
        nodes.forEach((node) => {
            node.x += node.vx;
            node.y += node.vy;
            node.pulsePhase += 0.02;

            // Bounce off edges
            if (node.x < 0 || node.x > width) node.vx *= -1;
            if (node.y < 0 || node.y > height) node.vy *= -1;

            // Keep in bounds
            node.x = Math.max(0, Math.min(width, node.x));
            node.y = Math.max(0, Math.min(height, node.y));
        });

        // Draw connections
        nodes.forEach((node, i) => {
            node.connections.forEach((j) => {
                const other = nodes[j];
                const dx = other.x - node.x;
                const dy = other.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * baseAlpha;

                    // Pulsing connection
                    const pulse = Math.sin(time * 0.002 + node.pulsePhase) * 0.5 + 0.5;
                    const pulseAlpha = alpha * (0.5 + pulse * 0.5);

                    // Gradient connection line
                    const gradient = ctx.createLinearGradient(node.x, node.y, other.x, other.y);
                    gradient.addColorStop(0, `rgba(255, 26, 26, ${pulseAlpha})`);
                    gradient.addColorStop(0.5, `rgba(255, 51, 51, ${pulseAlpha * 1.2})`);
                    gradient.addColorStop(1, `rgba(255, 26, 26, ${pulseAlpha})`);

                    ctx.beginPath();
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();

                    // Data pulse traveling along connection
                    if (Math.random() < 0.001) {
                        const pulsePos = (time * 0.001) % 1;
                        const px = node.x + dx * pulsePos;
                        const py = node.y + dy * pulsePos;

                        ctx.beginPath();
                        ctx.fillStyle = `rgba(255, 100, 100, ${alpha * 2})`;
                        ctx.arc(px, py, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });
        });

        // Draw nodes
        nodes.forEach((node) => {
            const pulse = Math.sin(time * 0.003 + node.pulsePhase) * 0.5 + 0.5;
            const glowRadius = node.radius * (2 + pulse);
            const nodeAlpha = baseAlpha * (0.6 + pulse * 0.4);

            // Outer glow
            const gradient = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, glowRadius * 3
            );
            gradient.addColorStop(0, `rgba(255, 51, 51, ${nodeAlpha * 0.8})`);
            gradient.addColorStop(0.5, `rgba(255, 26, 26, ${nodeAlpha * 0.3})`);
            gradient.addColorStop(1, "rgba(255, 26, 26, 0)");

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(node.x, node.y, glowRadius * 3, 0, Math.PI * 2);
            ctx.fill();

            // Core node
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 80, 80, ${nodeAlpha * 1.5})`;
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        animationRef.current = requestAnimationFrame((t) => animate(ctx, width, height, t));
    }, [intensity]);

    // Setup
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

            initializeNodes(rect.width, rect.height);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        // Start animation
        animationRef.current = requestAnimationFrame((t) =>
            animate(ctx, canvas.width, canvas.height, t)
        );

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [animate, initializeNodes]);

    return (
        <canvas
            ref={canvasRef}
            className={`${styles.canvas} ${className}`}
        />
    );
}

export default NeuralNetwork;
