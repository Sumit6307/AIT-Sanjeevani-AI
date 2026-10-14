# 🩺 Sanjeevni — Smart Rural Telehealth & Pharmacy Intelligence Platform

Sanjeevni is an advanced, high-performance telemedicine and rural health logistics platform built for **low-bandwidth, multilingual, and medicine-scarce environments**. Designed with a high-contrast **Neobrutalist UI**, it guarantees maximum legibility, zero-confusion workflows, and offline accessibility for patients, doctors, village pharmacies, and regional health administrators.

---

## 📑 Table of Contents
1. [User Roles Overview](#-user-roles-overview)
2. [Step-by-Step: Creating User Profiles](#-step-by-step-creating-user-profiles)
   - [1. Patient Profile Onboarding](#1-patient-profile-onboarding)
   - [2. Doctor Profile Onboarding](#2-doctor-profile-onboarding)
   - [3. Pharmacy Profile Onboarding](#3-pharmacy-profile-onboarding)
   - [4. Administrator Profile](#4-administrator-profile)
3. [Step-by-Step: Admin Approval Workflow](#-step-by-step-admin-approval-workflow)
   - [How Admin Approves Doctors and Pharmacies](#how-admin-approves-doctors-and-pharmacies)
   - [What Happens Upon Approval](#what-happens-upon-approval)
4. [End-to-End Product Flow](#-end-to-end-product-flow)
5. [Core Platform Capabilities](#-core-platform-capabilities)
6. [Technology Stack](#-technology-stack)
7. [Localhost Development Guide](#-localhost-development-guide)
8. [Production Deployment Guide](#-production-deployment-guide)

---

## 👥 User Roles Overview

Sanjeevni implements a multi-tier, role-based access control (RBAC) architecture:

| Role | Onboarding Approval | Core Capabilities |
| :--- | :--- | :--- |
| **PATIENT** | **Instant (Automatic)** | AI Symptom Triage, Doctor Video/Audio Consults, QR Prescriptions, Offline Pharmacy Stock Search, Medicine Reservation, SOS Emergency Alert. |
| **DOCTOR** | **Requires Admin Approval** | Patient Queue Management, Low-Bandwidth Video/Audio Consultations, Digital QR Prescription Generator, Medical History Review. |
| **PHARMACY** | **Requires Admin Approval** | QR Prescription Scanner, Real-Time Drug Inventory Management, Generic Medicine Substitution, Patient Reservation Fulfillment. |
| **ADMIN** | **Superuser Access** | Verification of Doctor & Chemist Licenses, Live Emergency SOS Dispatch Simulation, System Analytics, Audit Log Inspection. |

---

## 📝 Step-by-Step: Creating User Profiles

### 1. Patient Profile Onboarding

Patients can self-register and gain immediate access to telehealth consultations and village pharmacy directories.

1. Navigate to the portal and click **"Need an account? Sign Up"** (or open `/login`).
2. Enter:
   - **Full Name** (e.g., `Ramesh Kumar`)
   - **Email Address** (e.g., `ramesh@gmail.com`)
   - **Password** (min. 8 characters)
3. Click **"Create Account"**. You will be directed to `/dashboard`.
4. In the **"Complete Your Profile"** card:
   - Select **"I am a: Patient"**.
   - Enter **Phone Number** (e.g., `+91 98765 43210`).
   - Enter **Age** (e.g., `42`) and select **Gender**.
   - Enter **Blood Group** (e.g., `O+`).
   - Enter **Village / Gram Panchayat** (e.g., `Rampur`).
   - Choose **Preferred Language** (English, Hindi, etc.).
5. Click **"Save Patient Profile"**.
6. **Result**: Your account is **instantly approved**. The system redirects you directly to the **Patient Portal** where you can triage symptoms, book doctors, and search village medicine inventory.

---

### 2. Doctor Profile Onboarding

To prevent fraudulent medical practices, doctor accounts are held in a **`PENDING`** state until an administrator verifies their credentials.

1. Click **"Need an account? Sign Up"** on the login page.
2. Enter:
   - **Full Name** (e.g., `Dr. Ananya Sharma`)
   - **Email Address** (e.g., `dr.ananya@hospital.org`)
   - **Password** (min. 8 characters)
3. Click **"Create Account"**. You will be directed to `/dashboard`.
4. In the **"Complete Your Profile"** card:
   - Select **"I am a: Doctor"**.
   - Enter **Phone Number** (for emergency escalation).
   - Enter **Specialty** (e.g., `General Medicine`, `Pediatrics`, `Cardiology`, `Gynecology`).
   - Enter **Medical License Number** (e.g., `MCI-2018-847291`).
   - Enter **Languages Spoken** (e.g., `Hindi, English, Bhojpuri`).
   - Set **Consultation Availability Slots** (Days of week and consulting hours).
   - Toggle **Emergency Priority** if you accept urgent ICU/SOS call transfers.
5. Click **"Submit Doctor Application"**.
6. **Result**: Your status is placed in **`PENDING`**. You will see the verification screen:
   > ⏳ **Verification Request Submitted**  
   > *"Your application has been successfully submitted to the administrator. Once your medical license is verified, your doctor workspace will be activated."*

---

### 3. Pharmacy Profile Onboarding

To ensure authentic drug distribution and legitimate prescription handling, pharmacy accounts require administrative verification.

1. Click **"Need an account? Sign Up"** on the login page.
2. Enter:
   - **Representative Name** (e.g., `Suresh Patel`)
   - **Email Address** (e.g., `patel.medical@gmail.com`)
   - **Password** (min. 8 characters)
3. Click **"Create Account"**. You will be directed to `/dashboard`.
4. In the **"Complete Your Profile"** card:
   - Select **"I am a: Pharmacy"**.
   - Enter **Pharmacy Display Name** (e.g., `Patel Gramin Aushadhi Kendra`).
   - Enter **Drug License / Registration Number** (e.g., `DL-UP-2022-58190`).
   - Enter **Village / Location** (e.g., `Main Chauraha, Rampur`).
   - Enter **Contact Phone Number**.
5. Click **"Submit Pharmacy Application"**.
6. **Result**: Your status is placed in **`PENDING`**. You will see:
   > ⏳ **Verification State: Pending Admin Approval**  
   > *"Your pharmacy profile is under review by the health board administrator."*

---

### 4. Administrator Profile

The platform includes a built-in administrator account for health post managers:

- **Email**: `admin@admin.com`
- **Password**: `admin123`

#### Quick Login Options:
- **Navbar Button**: Click the **`🛡️ Admin Login`** button in the top navigation bar.
- **Direct Login**: Navigate to `/login`, enter `admin@admin.com` and `admin123`, and click **Sign In**.
- **Auto-Bootstrap**: If connecting to a fresh database, submitting these credentials **automatically provisions** the Administrator role and opens the **Admin Command Center**.

---

## 🛡️ Step-by-Step: Admin Approval Workflow

### How Admin Approves Doctors and Pharmacies

```mermaid
graph TD
    DoctorOrPharm[Doctor/Pharmacy signs up] --> Pending[Status: PENDING]
    Pending --> AdminLogin[Admin logs into Command Center]
    AdminLogin --> Table[Review Pending User Verifications Table]
    Table --> Inspect[Verify Medical/Drug License Number]
    Inspect --> Actions{Admin Decision}
    Actions -->|Click Approve| Approved[Status: APPROVED]
    Actions -->|Click Reject| Rejected[Status: REJECTED]
    Actions -->|Click Suspend| Suspended[Status: SUSPENDED]
    Approved --> Unlocked[User Workspace Unlocks Immediately]
```

1. **Log In as Admin**:
   - Go to `/login` or click **`🛡️ Admin Login`** in the navbar.
   - Enter `admin@admin.com` and `admin123`.
2. **Open the Admin Dashboard**:
   - You will land directly on the **Administrator Portal** (`/dashboard#admin-dashboard`).
3. **Locate Pending Verifications**:
   - Scroll to the **"Pending User Verifications"** (`dashboard.admin.pendingApprovals`) section.
   - You will see a list of all newly registered Doctors and Pharmacies.
4. **Inspect User Details**:
   - **Doctor Application**: Displays Doctor's name, email, specialty (e.g., *Pediatrics*), and submitted Medical Council Registration Number.
   - **Pharmacy Application**: Displays Pharmacist's name, pharmacy display name (e.g., *Patel Gramin Aushadhi Kendra*), and Drug License Number.
5. **Take Action**:
   - ✅ **Approve**: Click the green **"Approve"** button. The user's `approvalState` is immediately updated to `APPROVED` in PostgreSQL.
   - ❌ **Reject**: Click the outline **"Reject"** button if the license number is invalid.
   - 🚫 **Suspend**: Click the red **"Suspend"** button to freeze an existing user.

---

### What Happens Upon Approval

- **For Doctors**:
  - The Doctor clicks **"🔄 Check Status"** (or refreshes their dashboard).
  - The pending gate automatically unlocks.
  - The Doctor now has full access to:
    - **Consultation Queue**: Start adaptive video/voice consultations.
    - **Digital Rx Pad**: Create tamper-proof QR prescriptions with dosage, frequency, and duration.
    - **Patient History**: Review previous diagnoses and uploaded medical reports.

- **For Pharmacies**:
  - The Chemist clicks **"🔄 Check Status"** (or refreshes their dashboard).
  - The pending gate automatically unlocks.
  - The Chemist now has full access to:
    - **QR Prescription Scanner**: Point device camera at patient's Rx QR code to decrypt dosage instructions and dispense medicine.
    - **Inventory Management**: Update in-stock quantities, prices in Rupees/Paise, and mark items as available.
    - **Reservation Orders**: View and fulfill medicines reserved by patients before they arrive at the shop.

---

## 🔄 End-to-End Product Flow

```text
[1. Patient] ──────> Enters symptoms in Hindi/English
       │
       ▼
[2. AI Triage] ────> Evaluates urgency (CRITICAL / URGENT / MODERATE / ROUTINE)
       │              If Critical ──> Alerts Admin & triggers Ambulance SOS Map
       ▼
[3. Consultation] ──> Video/Audio call connects with an Approved Doctor
       │              (Automatically degrades to voice if network <2G drops)
       ▼
[4. Digital Rx] ───> Doctor generates encrypted QR code prescription
       │
       ▼
[5. Local Chemist] ─> Patient walks to village pharmacy (even with NO internet)
       │              Chemist scans QR code ──> Automatically deducts stock
       ▼
[6. Fulfillment] ──> Medicine dispensed, patient record updated
```

---

## 🌟 Core Platform Capabilities

### 1. 🚨 Emergency SOS & Live Ambulance Dispatch Map
- **Live GPS Simulation**: Administrators can view real-time vector street maps tracking simulated ambulances traversing rural routes to emergency patient coordinates.
- **Direct Contact**: Admins can trigger instant cellular phone calls or dispatch emergency responders directly from the SOS feed.

### 2. 💊 Smart Pharmacy Inventory & Generic Drug Substitution
- **Stock Transparency**: Village residents can check live pharmacy stock before walking long distances.
- **Generic Fallback**: If a prescribed brand is unavailable, the system automatically suggests chemically identical generic alternatives to save costs.

### 3. 📱 Visual Prescription Cards & QR Tokens
- **Visual Schedules**: Prescriptions are translated into time-of-day iconography (Morning 🌅, Afternoon ☀️, Evening 🌆, Night 🌙) for low-literacy patients.
- **Offline QR Codes**: Works with zero active mobile network. The QR code contains complete self-contained prescription payload readable by chemists offline.

### 4. 🌐 Adaptive Connectivity Engine
- **Active Latency Probing**: Continuously monitors ping and connection jitter.
- **Graceful Fallback**: Video calls automatically switch to high-clarity voice calls when signal quality degrades on 2G/3G connections.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16** (App Router) | Server-Side Rendering (SSR), React 19, Turbopack |
| **Styling & Design System** | **Neobrutalism** | Custom Tailwind CSS v4 tokens, thick borders, high-contrast shadows |
| **API Backend** | **Hono** | Ultrafast edge-ready TypeScript router hosted on Bun |
| **Database & ORM** | **PostgreSQL** + **Prisma ORM** | Relational schema with automatic migrations |
| **Runtime & Monorepo** | **Bun 1.3** + **Turborepo** | Blazing-fast workspace package orchestration |
| **AI Clinical Triage** | **Google Gemini AI** | Structured clinical symptom evaluation & urgency categorization |

---

## 💻 Localhost Development Guide

### Prerequisites
- **Bun** installed (`curl -fsSL https://bun.sh/install | bash` or via Windows installer)
- Running **PostgreSQL** database

### 1. Clone & Install Dependencies
```bash
bun install
```

### 2. Environment Setup
Configure your root `.env` file:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sanjeevani?schema=public"
BETTER_AUTH_SECRET="7a6c9c64b58ad4e5c45e67bc9812e34fa98d245c43d2c18abde1762cba39d5e2"
BETTER_AUTH_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3001"
NODE_ENV="development"
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
GEMINI_API_KEY="your_gemini_api_key"
GEMINI_MODEL="gemini-2.5-flash"
```

### 3. Push Database Schema
```bash
bun run db:push
```

### 4. Run Both Frontend and Backend Concurrently
```bash
bun run dev
```

- **Frontend (Next.js)**: [http://localhost:3001](http://localhost:3001)
- **Backend (Hono API)**: [http://localhost:3000](http://localhost:3000)

---

## 🚀 Production Deployment Guide

### Frontend on Vercel
1. Connect your GitHub repository to **Vercel**.
2. Set Root Directory to: `Sanjeevani-Project-main/Krygen-YUKTI--main/apps/web` (or root depending on setup).
3. Set Environment Variable:
   - `NEXT_PUBLIC_SERVER_URL`: `https://your-backend-app.onrender.com`
4. **Important**: Under **Settings > Deployment Protection**, set **Vercel Authentication** to **Disabled**.

### Backend on Render
1. Create a **Web Service** on [Render](https://dashboard.render.com).
2. Set Build Command:
   ```bash
   curl -fsSL https://bun.sh/install | bash && export PATH="/opt/render/.bun/bin:$PATH" && bun install && bun --filter=@my-better-t-app/db db:generate && bun run build --filter=server && bun --filter=@my-better-t-app/db db:push
   ```
3. Set Start Command:
   ```bash
   export PATH="/opt/render/.bun/bin:$PATH" && cd apps/server && bun run start
   ```
4. Set Environment Variables:
   - `DATABASE_URL`: Internal PostgreSQL connection string from Render.
   - `BETTER_AUTH_URL`: `https://your-backend-app.onrender.com`
   - `CORS_ORIGIN`: `https://your-frontend-app.vercel.app`
   - `BETTER_AUTH_SECRET`: Random 32+ character string.
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: Your Google Gemini API key.

---

## 📜 License & Compliance
Sanjeevni is designed and developed as a rural digital healthcare prototype. All health records, emergency SOS dispatches, and QR prescriptions comply with rural accessibility guidelines and data privacy standards.
