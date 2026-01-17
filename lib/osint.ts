/**
 * OSINT Simulation Engine
 * 
 * Generates realistic OSINT-style reconnaissance findings
 * based on the victim's submitted data (name, phone, email).
 * 
 * Uses a hybrid approach:
 * - Real API: DataYuge for Indian phone carrier/circle (free)
 * - Simulated: Everything else for exhibition reliability
 */

// ===================================
// TYPES
// ===================================

export interface VictimData {
    name: string;
    phone: string;
    email: string;
    timestamp: number;
}

export interface PhoneAnalysis {
    number: string;
    carrier?: string;
    circle?: string;
    type: "mobile" | "landline" | "unknown";
    whatsapp: boolean;
    truecaller?: string;
    upiApps: string[];
}

export interface EmailAnalysis {
    address: string;
    provider: string;
    domain: string;
    gravatar: boolean;
    breachCount: number;
    breaches: string[];
    socialAccounts: string[];
    github?: { repos: number; username: string };
}

export interface NameAnalysis {
    fullName: string;
    possibleUsernames: string[];
    socialMedia: SocialMediaFinding[];
    professional?: {
        company: string;
        role: string;
    };
}

export interface SocialMediaFinding {
    platform: string;
    username?: string;
    profileUrl?: string;
    found: boolean;
    details?: string;
}

export interface OSINTResult {
    phone?: PhoneAnalysis;
    email?: EmailAnalysis;
    name?: NameAnalysis;
    scanDuration: number;
    totalFindings: number;
    riskLevel: "low" | "medium" | "high" | "critical";
}

// ===================================
// PHONE OSINT
// ===================================

const INDIAN_CARRIERS: Record<string, string[]> = {
    "Jio": ["6", "7", "8", "9"],
    "Airtel": ["6", "7", "8", "9"],
    "Vi (Vodafone Idea)": ["6", "7", "8", "9"],
    "BSNL": ["6", "7", "8", "9"],
};

const INDIAN_CIRCLES = [
    "Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore",
    "Hyderabad", "Ahmedabad", "Pune", "West Bengal", "Maharashtra",
    "Tamil Nadu", "Karnataka", "Gujarat", "Rajasthan", "UP East",
    "UP West", "Bihar", "Orissa", "Assam", "North East",
];

const UPI_APPS = ["Google Pay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"];

export async function analyzePhone(phone: string): Promise<PhoneAnalysis | null> {
    if (!phone || phone.length !== 10) return null;

    const cleanPhone = phone.replace(/\s/g, "");

    // Try real API first (DataYuge)
    let carrier = "Unknown";
    let circle = "Unknown";

    try {
        const response = await fetch(`https://api.datayuge.com/v1/lookup/${cleanPhone}`, {
            headers: { "Accept": "application/json" },
            signal: AbortSignal.timeout(3000),
        });

        if (response.ok) {
            const data = await response.json();
            carrier = data.operator || carrier;
            circle = data.circle || circle;
        }
    } catch {
        // Fallback to simulation if API fails
        const carriers = Object.keys(INDIAN_CARRIERS);
        carrier = carriers[Math.floor(Math.random() * carriers.length)];
        circle = INDIAN_CIRCLES[Math.floor(Math.random() * INDIAN_CIRCLES.length)];
    }

    // Simulate additional findings
    const linkedApps = UPI_APPS.filter(() => Math.random() > 0.4);

    return {
        number: cleanPhone,
        carrier,
        circle,
        type: "mobile",
        whatsapp: Math.random() > 0.2, // 80% chance
        truecaller: Math.random() > 0.3 ? generateTruecallerName(cleanPhone) : undefined,
        upiApps: linkedApps,
    };
}

function generateTruecallerName(phone: string): string {
    const lastDigit = parseInt(phone.slice(-1));
    const prefixes = ["Verified", "Business", "Spam Risk", ""];
    return prefixes[lastDigit % prefixes.length] || "";
}

// ===================================
// EMAIL OSINT
// ===================================

const EMAIL_PROVIDERS: Record<string, string> = {
    "gmail.com": "Google",
    "googlemail.com": "Google",
    "yahoo.com": "Yahoo",
    "yahoo.in": "Yahoo India",
    "hotmail.com": "Microsoft",
    "outlook.com": "Microsoft",
    "live.com": "Microsoft",
    "icloud.com": "Apple",
    "protonmail.com": "ProtonMail",
    "rediffmail.com": "Rediff",
};

const KNOWN_BREACHES = [
    { name: "LinkedIn", year: 2021, records: "700M" },
    { name: "Facebook", year: 2021, records: "533M" },
    { name: "Canva", year: 2019, records: "137M" },
    { name: "Adobe", year: 2013, records: "153M" },
    { name: "Dropbox", year: 2012, records: "68M" },
    { name: "Twitter", year: 2022, records: "5.4M" },
    { name: "MGM Resorts", year: 2019, records: "10.6M" },
    { name: "Zynga", year: 2019, records: "173M" },
];

const SOCIAL_PLATFORMS = [
    "LinkedIn", "Facebook", "Instagram", "Twitter/X", "GitHub",
    "Pinterest", "Spotify", "Discord", "Reddit", "Snapchat",
];

export async function analyzeEmail(email: string): Promise<EmailAnalysis | null> {
    if (!email || !email.includes("@")) return null;

    const [localPart, domain] = email.toLowerCase().split("@");
    const provider = EMAIL_PROVIDERS[domain] || "Custom Domain";

    // Simulate breach findings (1-4 breaches)
    const breachCount = Math.floor(Math.random() * 4) + 1;
    const breaches = KNOWN_BREACHES
        .sort(() => Math.random() - 0.5)
        .slice(0, breachCount)
        .map(b => `${b.name} (${b.year})`);

    // Simulate social media findings
    const foundPlatforms = SOCIAL_PLATFORMS
        .filter(() => Math.random() > 0.5)
        .slice(0, 4);

    // Simulate GitHub presence
    const hasGithub = foundPlatforms.includes("GitHub") || Math.random() > 0.6;
    const githubData = hasGithub ? {
        repos: Math.floor(Math.random() * 30) + 3,
        username: localPart.replace(/[^a-z0-9]/g, ""),
    } : undefined;

    return {
        address: email,
        provider,
        domain,
        gravatar: Math.random() > 0.5,
        breachCount,
        breaches,
        socialAccounts: foundPlatforms,
        github: githubData,
    };
}

// ===================================
// NAME OSINT
// ===================================

const COMPANIES = [
    "TCS", "Infosys", "Wipro", "HCL", "Tech Mahindra",
    "Accenture", "Cognizant", "IBM India", "Microsoft India",
    "Google India", "Amazon India", "Flipkart", "Paytm",
];

const ROLES = [
    "Software Engineer", "Data Analyst", "Product Manager",
    "UI/UX Designer", "DevOps Engineer", "Full Stack Developer",
    "Mobile Developer", "Cloud Architect", "Business Analyst",
];

export async function analyzeName(name: string): Promise<NameAnalysis | null> {
    if (!name || name.trim().length < 2) return null;

    const cleanName = name.trim();
    const parts = cleanName.toLowerCase().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts[parts.length - 1] || "";

    // Generate possible usernames
    const usernames = [
        `${firstName}${lastName}`,
        `${firstName}.${lastName}`,
        `${firstName}_${lastName}`,
        `${firstName}${lastName}${Math.floor(Math.random() * 99)}`,
        `${lastName}${firstName}`,
        firstName + (Math.floor(Math.random() * 9000) + 1000),
    ].filter(u => u.length > 3);

    // Simulate social media findings
    const socialMedia: SocialMediaFinding[] = [
        {
            platform: "LinkedIn",
            found: Math.random() > 0.3,
            username: `${firstName}-${lastName}`,
            details: Math.random() > 0.5 ? "500+ connections" : undefined,
        },
        {
            platform: "Facebook",
            found: Math.random() > 0.4,
            details: "Profile located",
        },
        {
            platform: "Instagram",
            found: Math.random() > 0.5,
            username: `@${firstName}.${lastName}`,
            details: Math.random() > 0.5 ? `${Math.floor(Math.random() * 500) + 50} followers` : undefined,
        },
        {
            platform: "Twitter/X",
            found: Math.random() > 0.6,
            username: `@${firstName}${lastName}`,
        },
    ];

    // Professional info (50% chance)
    const professional = Math.random() > 0.5 ? {
        company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
        role: ROLES[Math.floor(Math.random() * ROLES.length)],
    } : undefined;

    return {
        fullName: cleanName,
        possibleUsernames: usernames.slice(0, 4),
        socialMedia,
        professional,
    };
}

// ===================================
// MAIN OSINT FUNCTION
// ===================================

export async function performOSINT(victim: VictimData): Promise<OSINTResult> {
    const startTime = Date.now();

    // Run all analyses in parallel
    const [phoneResult, emailResult, nameResult] = await Promise.all([
        victim.phone ? analyzePhone(victim.phone) : null,
        victim.email ? analyzeEmail(victim.email) : null,
        victim.name ? analyzeName(victim.name) : null,
    ]);

    const scanDuration = (Date.now() - startTime) / 1000;

    // Count total findings
    let findings = 0;
    if (phoneResult) {
        findings += 3; // carrier, circle, type
        if (phoneResult.whatsapp) findings++;
        if (phoneResult.truecaller) findings++;
        findings += phoneResult.upiApps.length;
    }
    if (emailResult) {
        findings += emailResult.breachCount;
        findings += emailResult.socialAccounts.length;
        if (emailResult.github) findings += 2;
        if (emailResult.gravatar) findings++;
    }
    if (nameResult) {
        findings += nameResult.socialMedia.filter(s => s.found).length;
        if (nameResult.professional) findings += 2;
    }

    // Determine risk level
    let riskLevel: OSINTResult["riskLevel"] = "low";
    if (findings > 5) riskLevel = "medium";
    if (findings > 10) riskLevel = "high";
    if (findings > 15) riskLevel = "critical";

    return {
        phone: phoneResult || undefined,
        email: emailResult || undefined,
        name: nameResult || undefined,
        scanDuration: Math.max(scanDuration, 8 + Math.random() * 4), // Min 8-12 seconds for drama
        totalFindings: findings,
        riskLevel,
    };
}

// ===================================
// TERMINAL OUTPUT GENERATOR
// ===================================

export interface TerminalLine {
    text: string;
    type: "info" | "warning" | "success" | "error" | "header" | "subitem";
    delay: number;
}

export function generateTerminalOutput(result: OSINTResult, victim: VictimData): TerminalLine[] {
    const lines: TerminalLine[] = [];
    let delay = 0;
    const addDelay = (ms: number) => { delay += ms; return delay; };

    // Header
    lines.push({ text: "[OSINT] Initiating reconnaissance on target...", type: "header", delay: addDelay(500) });

    if (victim.name) {
        lines.push({ text: `[OSINT] Target identified: "${victim.name}"`, type: "info", delay: addDelay(800) });
    }

    // Phone analysis
    if (result.phone) {
        lines.push({ text: `[SCAN] Analyzing phone: +91 ${result.phone.number.slice(0, 5)} XXXXX`, type: "header", delay: addDelay(1000) });
        lines.push({ text: `   ├─ Carrier: ${result.phone.carrier} (${result.phone.circle} Circle)`, type: "subitem", delay: addDelay(400) });

        if (result.phone.whatsapp) {
            lines.push({ text: `   ├─ WhatsApp: Account EXISTS`, type: "success", delay: addDelay(300) });
        }

        if (result.phone.truecaller) {
            lines.push({ text: `   ├─ Truecaller: ${result.phone.truecaller || "Registered user"}`, type: "info", delay: addDelay(300) });
        }

        if (result.phone.upiApps.length > 0) {
            lines.push({ text: `   └─ UPI Apps: ${result.phone.upiApps.join(", ")}`, type: "warning", delay: addDelay(400) });
        }
    }

    // Email analysis
    if (result.email) {
        lines.push({ text: `[SCAN] Email reconnaissance: ${result.email.address}`, type: "header", delay: addDelay(1200) });
        lines.push({ text: `   ├─ Provider: ${result.email.provider}`, type: "subitem", delay: addDelay(300) });

        if (result.email.gravatar) {
            lines.push({ text: `   ├─ Gravatar: Profile photo FOUND`, type: "success", delay: addDelay(300) });
        }

        if (result.email.breachCount > 0) {
            lines.push({ text: `   ├─ HaveIBeenPwned: ${result.email.breachCount} BREACHES DETECTED!`, type: "error", delay: addDelay(400) });
            result.email.breaches.forEach(breach => {
                lines.push({ text: `   │    └─ ${breach}`, type: "warning", delay: addDelay(200) });
            });
        }

        if (result.email.github) {
            lines.push({ text: `   ├─ GitHub: ${result.email.github.repos} public repositories`, type: "info", delay: addDelay(300) });
        }

        if (result.email.socialAccounts.length > 0) {
            lines.push({ text: `   └─ Social accounts: ${result.email.socialAccounts.join(", ")}`, type: "success", delay: addDelay(400) });
        }
    }

    // Name analysis
    if (result.name) {
        lines.push({ text: `[SCAN] Social media footprint analysis...`, type: "header", delay: addDelay(1000) });

        result.name.socialMedia.forEach(social => {
            if (social.found) {
                const details = social.details ? ` (${social.details})` : "";
                const username = social.username ? `: ${social.username}` : "";
                lines.push({ text: `   ├─ ${social.platform}${username}${details}`, type: "success", delay: addDelay(350) });
            } else {
                lines.push({ text: `   ├─ ${social.platform}: No match`, type: "subitem", delay: addDelay(200) });
            }
        });

        if (result.name.professional) {
            lines.push({ text: `[INTEL] Professional profile detected`, type: "header", delay: addDelay(800) });
            lines.push({ text: `   ├─ ${result.name.professional.role}`, type: "info", delay: addDelay(300) });
            lines.push({ text: `   └─ ${result.name.professional.company}`, type: "info", delay: addDelay(300) });
        }
    }

    // Summary
    lines.push({ text: `[COMPILE] Building target profile...`, type: "header", delay: addDelay(1500) });
    lines.push({ text: `[STATUS] ${result.totalFindings} data points aggregated`, type: "info", delay: addDelay(500) });
    lines.push({ text: `[WARNING] Personal data compiled in ${result.scanDuration.toFixed(1)} seconds`, type: "error", delay: addDelay(800) });
    lines.push({ text: `[ALERT] Risk level: ${result.riskLevel.toUpperCase()}`, type: result.riskLevel === "critical" ? "error" : "warning", delay: addDelay(600) });

    return lines;
}
