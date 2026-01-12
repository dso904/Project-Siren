"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import styles from "./DataStream.module.css";

/**
 * DataStream Component
 * 
 * Large numeric displays showing "captured" data like
 * phone numbers and IPs with rapid cycling animation.
 */

interface DataStreamProps {
    phase: "initializing" | "scanning" | "cracking" | "extracting" | "breach" | "complete";
    className?: string;
}

export function DataStream({ phase, className = "" }: DataStreamProps) {
    const [numbers, setNumbers] = useState<string[]>(["0000000000", "0000000000", "0000000000"]);
    const [isScrambling, setIsScrambling] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Target "captured" numbers
    const targetNumbers = ["19863773288", "84763451678", "46347145858"];

    // Scramble effect
    useEffect(() => {
        if (phase === "extracting" || phase === "breach") {
            setIsScrambling(true);

            let iterations = 0;
            const maxIterations = 30;

            intervalRef.current = setInterval(() => {
                iterations++;

                setNumbers(prev => prev.map((num, index) => {
                    if (iterations > maxIterations) {
                        return targetNumbers[index];
                    }
                    // Progressive reveal
                    const revealCount = Math.floor((iterations / maxIterations) * 11);
                    const revealed = targetNumbers[index].slice(0, revealCount);
                    const scrambled = Array.from({ length: 11 - revealCount }, () =>
                        Math.floor(Math.random() * 10).toString()
                    ).join("");
                    return revealed + scrambled;
                }));

                if (iterations >= maxIterations) {
                    clearInterval(intervalRef.current!);
                    setIsScrambling(false);
                }
            }, 50);

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        } else if (phase === "complete") {
            setNumbers(targetNumbers);
            setIsScrambling(false);
        } else {
            // Idle scramble
            setIsScrambling(true);
            intervalRef.current = setInterval(() => {
                setNumbers(prev => prev.map(() =>
                    Array.from({ length: 11 }, () =>
                        Math.floor(Math.random() * 10).toString()
                    ).join("")
                ));
            }, 100);

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        }
    }, [phase]);

    const formatNumber = (num: string) => {
        // Format as phone number style
        return num.replace(/(\d{1})(\d{4})(\d{3})(\d{3})/, "$1$2$3$4");
    };

    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.header}>
                <span className={styles.icon}>📞</span>
                <span className={styles.title}>INTERCEPTED DATA</span>
            </div>

            <div className={styles.numbers}>
                {numbers.map((num, index) => (
                    <motion.div
                        key={index}
                        className={`${styles.number} ${!isScrambling && phase === "complete" ? styles.captured : ""}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {formatNumber(num)}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default DataStream;
