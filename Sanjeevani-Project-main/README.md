# 🩺 Sanjeevni — Smart Rural Telehealth & Pharmacy Intelligence Platform

Sanjeevni is an advanced, high-performance telemedicine platform designed for **real-world healthcare accessibility** in low-bandwidth, multilingual, and medicine-scarce environments. It features a custom **Neobrutalist UI** system designed for high visual contrast and offline accessibility.

---

## 🚀 Live Deployments

*   **Frontend (Next.js App)**: [https://sanjeevani-eta.vercel.app](https://sanjeevani-eta.vercel.app)
*   **Backend (Hono API Server)**: [https://sanjeevani-backend1.onrender.com](https://sanjeevani-backend1.onrender.com)

---

## 🛠️ Technology Stack & Badges

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Bun](https://img.shields.io/badge/Bun-1.3-black?style=for-the-badge&logo=bun)
![Hono](https://img.shields.io/badge/Hono-API-ff69b4?style=for-the-badge&logo=hono)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-4169e1?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-0d9488?style=for-the-badge&logo=prisma)
![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444?style=for-the-badge&logo=turborepo)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06b6d4?style=for-the-badge&logo=tailwind-css)

---

## 📐 System Architecture

Below is the routing and connection dataflow of the platform:

```mermaid
graph TD
    Client[Browser Client]
    Vercel[Vercel Gateway: sanjeevani-eta.vercel.app]
    NextServer[Next.js Server Side Rendering]
    Render[Render Web Service: sanjeevani-backend1.onrender.com]
    DB[(Render PostgreSQL Database)]
    Gemini[Google Gemini AI API]

    Client -->|1. Signin/Actions| Vercel
    Vercel -->|2. Proxy Rewrites /api/auth or /api/mvp| Render
    Client -->|3. Page Load /dashboard| NextServer
    NextServer -->|4. SSR Fetch /api/auth/session| Render
    Render -->|5. Prisma ORM Operations| DB
    Render -->|6. Triage & Translation Queries| Gemini
```

---

## 🎨 Design Philosophy: Next-Level Neobrutalism

Sanjeevni rejects generic "soft/rounded" design templates in favor of **high-contrast Neobrutalism**. This visual system ensures maximum readability in direct sunlight, on cheap mobile displays, and for elderly or low-vision users.

*   **Zero Soft Gradients**: UI elements use flat, vibrant backgrounds (lime greens, bright blues, stark whites, deep dark mode grays).
*   **Thick Borders**: Everything is encased in solid `border-2` or `border-4` black outlines.
*   **Hard Drop Shadows**: Cards, buttons, and dropdown menus utilize rigid, solid offset drop shadows (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`).
*   **Micro-Animations**: Clickable buttons and cards physically push down on click and lift on hover for tactile response.
*   **Mobile-Friendly Layouts**: Large touch targets, simplified forms, and responsive grid layouts.

---

## 🧠 Core Feature Modules

### 🚨 1. Emergency Triage Intelligence
*   **Symptom Severity Analysis**: Takes raw patient symptom inputs and passes them to Google Gemini for clinical evaluation.
*   **Emergency Level Classification**: Automatically assigns one of four triage levels:
    | Severity Level | Alert Color | Routing Action |
    | :--- | :--- | :--- |
    | **CRITICAL** | Red | Urgent notification, triggers immediate dispatch options |
    | **URGENT** | Orange | Priority scheduling, flags for doctor priority review |
    | **MODERATE** | Yellow | Regular appointment scheduling |
    | **ROUTINE** | Green | Self-care advice and optional check-up |
*   **Live Simulation Map**: Real-time GPS ambulance dispatch simulation where admins can watch response vehicles traverse rural maps to patient coordinates.

### 💊 2. Smart Pharmacy Inventory & Generic Mapping
*   **Real-time Stock Search**: Patients can search for prescribed medicines in local pharmacies.
*   **Generic Fallback Suggestions**: If a drug is out-of-stock, the platform automatically suggests equivalent generic alternatives based on active chemical compounds.
*   **Distance & Price Sorting**: Compares inventory across pharmacies and lists them by distance and price.
*   **QR Prescription Scanner**: Pharmacies can load and verify patients' medical QR tokens to dispense medicines instantly and synchronize live inventory counts.

### 🌍 3. Multilingual Visual Prescription Cards
*   **Visual Schedule Cards**: Translates complicated dosages (e.g., *"Take 500mg twice a day after meals for five days"*) into simple scheduling cards.
*   **Time-of-day Iconography**: Visual icons indicate Morning, Afternoon, Evening, or Bedtime dosages.
*   **Instant Language translation**: Translates visual prescriptions into English, Hindi, Marathi, and other regional languages at the click of a button.

### 🌐 4. Adaptive Connectivity Fallback
*   **Active Ping Probing**: Client-side worker continuously measures network latency.
*   **Dynamic UI Fallback**:
    *   **Good Connection (<150ms)**: Standard video/audio consultation.
    *   **Poor Connection (150ms - 400ms)**: Automatically alerts user and disables incoming video stream to preserve bandwidth.
    *   **Critical Network (>400ms)**: Disables all video, switches to audio-only fallback mode, and loads a lightweight offline text notes sync engine.

---

## 🔁 Functional Workflows

```
1. Patient submits symptoms ──> AI evaluates severity ──> Assigns Triage Color ──> Alerts Doctors/Admins
2. Doctor drafts Rx ─────────> Generates QR Code ────────> Pharmacy scans QR ────> Deducts stock & dispenses
3. Network connection drops ─> Probes detect latency ───> Disables video stream ─> Keeps audio consultation live
```

---

## 📁 Monorepo Structure

The project is structured as a Bun workspaces monorepo orchestrated by Turborepo:

```
Sanjeevani-Project/
├── apps/
│   ├── web/                     # Next.js Frontend Application
│   │   ├── src/app/             # Next.js App Router (19 pages)
│   │   └── src/components/      # UI components & Neobrutalist styling
│   └── server/                  # Hono API Backend Server
│       └── src/routes/          # API route definitions (Prisma endpoints)
├── packages/
│   ├── db/                      # Shared Database Client & Prisma Schema
│   │   └── prisma/schema.prisma # PostgreSQL Data Model definitions
│   ├── auth/                    # Shared Crypto & Session Helpers
│   └── env/                     # Shared Zod-validated Environments
└── turbo.json                   # Turborepo Build Cache Settings
```

---

## ⚙️ Getting Started & Installation

### Prerequisites
*   Ensure **Bun v1.3.x** is installed on your local machine.
*   Ensure you have a running **PostgreSQL** database instance.

### 1. Clone the repository and install dependencies
```bash
bun install
```

### 2. Configure Local Environment Variables
Create a `.env` file at the monorepo root:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sanjeevani?schema=public"
BETTER_AUTH_SECRET="your_32_character_signing_key_here"
BETTER_AUTH_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3001"
NODE_ENV="development"
NEXT_PUBLIC_SERVER_URL="http://localhost:3001"
GEMINI_API_KEY="your_google_gemini_api_key"
GEMINI_MODEL="gemini-2.5-flash"
```

Configure the environment variables for `apps/web/.env`:
```env
NEXT_PUBLIC_SERVER_URL="http://localhost:3001"
```

Configure the environment variables for `apps/server/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sanjeevani?schema=public"
BETTER_AUTH_SECRET="ba_httsa66u4psk5w38s5r0u547k0w9o5us"
BETTER_AUTH_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3001"
NODE_ENV="development"
NEXT_PUBLIC_SERVER_URL="http://localhost:3001"
GEMINI_API_KEY="your_google_gemini_api_key"
GEMINI_MODEL="gemini-2.5-flash"
```

### 3. Generate Prisma Clients & Setup Database
```bash
bun run db:generate
bun run db:push
```

### 4. Start Development Servers
```bash
bun run dev
```
*   **Web App**: [http://localhost:3001](http://localhost:3001)
*   **API Server**: [http://localhost:3000](http://localhost:3000)

---

## 🧩 Scripts Directory

Run these commands from the monorepo root:

| Command | Action |
| :--- | :--- |
| `bun run dev` | Start development servers for both Web and API Backend concurrently |
| `bun run build` | Compile and package all apps for production deployment |
| `bun run check-types` | Run TypeScript compilation checks across all modules |
| `bun run db:generate` | Regenerate the Prisma database client |
| `bun run db:push` | Sync local database schema directly with target database |
| `bun run db:studio` | Open Prisma Studio database editor |
| `bun run dev:web` | Start development server only for the frontend |
| `bun run dev:server` | Start development server only for the Hono backend |

---

## 🌐 Production Deployment Configurations

### Frontend (Vercel)
1.  **Framework Preset**: `Next.js`
2.  **Root Directory**: `Krygen-YUKTI--main/apps/web` (Check *"Include source files outside root directory in the Build Step"*).
3.  **Build Command**: `cd ../.. && bun run build --filter=web`
4.  **Install Command**: `cd ../.. && bun install`
5.  **Environment Variables**:
    *   `NEXT_PUBLIC_SERVER_URL`: `https://sanjeevani-eta.vercel.app` *(The frontend URL, utilizing Vercel proxies to resolve cross-site cookies)*

### Backend (Render)
1.  **Build Command**:
    ```bash
    curl -fsSL https://bun.sh/install | bash && export PATH="/opt/render/.bun/bin:$PATH" && bun install && bun --filter=@my-better-t-app/db db:generate && bun run build --filter=server && bun --filter=@my-better-t-app/db db:push
    ```
2.  **Start Command**:
    ```bash
    export PATH="/opt/render/.bun/bin:$PATH" && cd apps/server && bun run start
    ```
3.  **Environment Variables**: Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (Render URL), `CORS_ORIGIN` (Vercel URL), `NODE_ENV=production`, `GEMINI_API_KEY`, and `GEMINI_MODEL`.

---

## 📜 License & Educational Use

Sanjeevni is released under educational license terms. Designed and developed as a rural digital healthcare prototype.
