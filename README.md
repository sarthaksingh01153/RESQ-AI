# RESQ AI — Intelligent Emergency Response & Rescue Coordination Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8)](https://tailwindcss.com)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-4285F4)](https://ai.google.dev)

RESQ AI is an AI-powered emergency reporting, monitoring, resource management, and rescue coordination platform built for national-level emergency response operations.

---

## Features

### For Citizens
- Report emergencies with GPS location and photo upload
- 3-step guided report wizard with form validation
- Real-time incident tracking via unique ID (no login required)
- Safety alerts and first-aid guidance per emergency type
- Incident status timeline with officer updates

### For Emergency Officers (Dashboard)
- Command-center overview with live stats and interactive map
- Incident list with advanced filtering, search, and sorting
- AI-powered incident analysis (priority scoring, key facts, risk assessment)
- AI-generated rescue plans with resource requirements and routing
- One-click dispatch approval workflow
- Weather conditions at incident location (Open-Meteo)
- Agent activity log showing every AI action

### For Inventory Managers
- Full inventory tracking across multiple depots
- Low stock alerts with configurable thresholds
- Stock adjustment with audit trail (stock-in, damaged, expired)
- Movement history per item
- Resource reservation and dispatch management

### For Rescue Teams
- Team assignment and deployment status
- Real-time incident updates

### AI Agents (4 Agents)
| Agent | Function |
|-------|----------|
| **Incident Analysis Agent** | Analyzes severity, estimates impact, scores priority |
| **Resource Planning Agent** | Determines required resources, checks inventory availability |
| **Routing & Awareness Agent** | Calculates optimal routes, weather-aware navigation |
| **Response Coordination Agent** | Coordinates dispatch, creates rescue plans |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + Radix UI |
| Database | SQLite + Prisma ORM |
| Auth | JWT (jose) + bcryptjs, httpOnly cookies |
| AI | Google Gemini 1.5 Flash (mock fallback included) |
| Maps | Leaflet + OpenStreetMap (free, no API key) |
| Weather | Open-Meteo API (free, no API key) |
| Charts | Recharts |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone and install

```bash
git clone <your-repo-url>
cd "RESQ AI"
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this-in-production"
GEMINI_API_KEY=""                    # Optional — leave empty for demo mode
NEXT_PUBLIC_DEMO_MODE="true"         # Set to "false" when using real Gemini key
```

> **Get a free Gemini API key:** https://aistudio.google.com/app/apikey

### 3. Set up database

```bash
npx prisma db push        # Create database schema
npx tsx prisma/seed.ts    # Seed demo data
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials

All demo accounts use password: **`demo1234`**

| Role | Email | Access |
|------|-------|--------|
| Admin | `admin@resqai.demo` | Full system access |
| Emergency Officer | `officer@resqai.demo` | Dashboard, incidents, dispatch |
| Inventory Manager | `inventory@resqai.demo` | Inventory management |
| Rescue Team | `team@resqai.demo` | Team view |
| Citizen | `citizen@resqai.demo` | Public portal |

---

## Project Structure

```
RESQ AI/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Login
│   ├── register/page.tsx           # Registration
│   ├── report/page.tsx             # Emergency report wizard
│   ├── track/[id]/page.tsx         # Incident tracking (public)
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout + sidebar
│   │   ├── page.tsx                # Officer overview
│   │   ├── incidents/
│   │   │   ├── page.tsx            # Incident list
│   │   │   └── [id]/page.tsx       # Incident detail
│   │   ├── inventory/page.tsx      # Inventory management
│   │   ├── analytics/page.tsx      # Charts + analytics
│   │   └── settings/page.tsx       # API status + config
│   └── api/                        # REST API routes
│       ├── auth/                   # Login, register, logout, me
│       ├── incidents/              # CRUD + analyze + rescue-plan
│       ├── inventory/              # CRUD + locations
│       ├── reservations/           # Approve resources
│       ├── dispatches/             # Confirm + return
│       ├── weather/                # Open-Meteo proxy
│       ├── maps/                   # Nearby resources
│       ├── notifications/          # User notifications
│       └── analytics/              # Dashboard stats
├── components/
│   ├── ui/                         # Radix-based UI components
│   └── dashboard/                  # Map, weather, stat cards, agent log
├── lib/
│   ├── agents/                     # 4 AI agent implementations
│   ├── services/                   # AI, weather, maps, inventory, notifications
│   ├── auth.ts                     # JWT + bcrypt helpers
│   ├── prisma.ts                   # Prisma client singleton
│   └── utils.ts                    # Shared utilities
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Demo data seeder
└── types/index.ts                  # TypeScript type definitions
```

---

## Emergency Workflow

```
Citizen Report
    ↓
AI Incident Analysis (priority, severity, key facts)
    ↓
Officer Review + Verification
    ↓
Resource Planning Agent (inventory check, team assignment)
    ↓
Routing & Awareness Agent (route calculation, weather check)
    ↓
Rescue Plan Generation
    ↓
Officer Approval → Dispatch
    ↓
Response Coordination Agent (monitors, updates)
    ↓
Incident Resolution → Analytics
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/incidents` | List / create incidents |
| GET/PATCH | `/api/incidents/[id]` | Get / update incident |
| GET | `/api/incidents/[id]/track` | Public tracking (no auth) |
| POST | `/api/incidents/[id]/analyze` | Run AI analysis |
| POST | `/api/incidents/[id]/rescue-plan` | Generate rescue plan |
| GET | `/api/incidents/[id]/timeline` | Incident timeline |
| GET | `/api/incidents/[id]/ai-activity` | Agent activity log |
| GET/POST | `/api/inventory` | List / add items |
| GET/PATCH | `/api/inventory/[id]` | Get / update item |
| POST | `/api/reservations/[id]/approve` | Approve reservation |
| POST | `/api/dispatches/[id]/confirm` | Confirm dispatch |
| POST | `/api/dispatches/[id]/return` | Return resources |
| GET | `/api/weather/current` | Weather data |
| GET | `/api/analytics/overview` | Dashboard analytics |
| GET | `/api/notifications` | User notifications |

---

## Supported Emergency Types

- 🌊 Flood
- 🔥 Fire  
- 🚗 Road Accident
- 🏥 Medical Emergency
- 🌍 Earthquake
- 🏗️ Building Collapse
- 👤 Missing Person
- ⚡ Other (configurable)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite DB path, e.g. `file:./dev.db` |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `GEMINI_API_KEY` | No | Google Gemini API key (empty = demo mode) |
| `NEXT_PUBLIC_DEMO_MODE` | No | `"true"` shows demo mode badges |

---

## Scripts

```bash
npm run dev           # Start development server
npm run build         # Production build
npm run start         # Start production server
npm run db:push       # Push schema to database
npm run db:seed       # Seed demo data
npm run db:reset      # Reset + reseed database
```

---

## License

MIT — Built for RESQ AI Hackathon Demo

