# 🎯 PROJECT SIREN

**Safe Honeypot for Cybersecurity Awareness**

A dramatic, Hollywood-style demonstration that educates users about the dangers of connecting to unknown Wi-Fi networks. Built for school exhibitions and cybersecurity awareness events.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.x-purple?style=flat-square)

---

## 🎬 What It Does

When users connect to a "free Wi-Fi" network and open any website:

1. **Fake Hack Simulation** - Matrix rain, spinning lock, terminal logs
2. **Dramatic Reveal** - "SIMULATION ENDED. You are safe."
3. **Education** - Tips on protecting yourself online
4. **Admin Dashboard** - Real-time SOC-style monitoring

> ⚠️ **For Educational Purposes Only** - No actual hacking occurs!

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to /hack |
| `/hack` | Fake hack simulation with visual effects |
| `/reveal` | Safety reveal with education |
| `/tips` | Protection tips and best practices |
| `/credits` | Team attribution |
| `/admin` | Real-time victim monitoring dashboard |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: CSS Modules + CSS Variables
- **Animations**: Framer Motion + GSAP
- **Real-time**: Server-Sent Events (SSE)
- **DNS**: Node.js dns2 package

---

## 🎨 Features

### Victim Experience
- 🌧️ Matrix rain effect (canvas-based)
- 🔐 Lock cracking animation
- 💻 Terminal typewriter logs
- 💥 Glitch transition effect
- 📚 Educational content

### Admin Dashboard
- 📊 Real-time victim counter
- 📡 Radar sweep visualization
- 📋 Live connection logs
- 📈 Device breakdown charts

---

## 📦 Project Structure

```
project-siren/
├── app/
│   ├── hack/          # Fake hack page
│   ├── reveal/        # Safety reveal
│   ├── tips/          # Protection tips
│   ├── credits/       # Team credits
│   ├── admin/         # SOC dashboard
│   └── api/           # Backend endpoints
├── components/
│   ├── effects/       # Visual effects
│   ├── admin/         # Dashboard components
│   └── ui/            # Reusable UI
├── lib/               # Utilities
└── dns-server.js      # DNS redirect (local only)
```

---

## 🔧 Exhibition Setup

For local exhibition with router DNS redirect:

1. Set static IP on laptop
2. Configure router DNS to point to laptop
3. Run `start-exhibition.bat` as Administrator

See [Router Setup Guide](./docs/router-setup.md) for details.

---

## 👥 Team

*Add your team members here*

---

## 📄 License

MIT License - For educational purposes only.

---

## ⚠️ Disclaimer

This project is designed for **educational demonstrations only**. It does not perform any actual hacking, data interception, or malicious activities. The "hack" simulation is entirely visual and serves to educate users about the importance of network security.
