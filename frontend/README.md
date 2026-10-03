# Kaucja Boys — Frontend Web App

Next.js web application for scanning vouchers, managing universal wallet balances, displaying checkout payment QRs, and browsing deposit machines.

## 🛠️ Stack

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS + Lucide Icons
- **Scanning & QR:** `@zxing/browser` + `react-qr-code`

---

## 🚀 Quickstart Guide for Teammates

### 1. Prerequisites

Ensure you have **Node.js 18+** installed.

### 2. Install Dependencies

From the project root:

```bash
cd frontend
npm install
```

### 3. Environment Setup

Create a .env.local file inside the frontend/ directory:
Code snippet

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run DEvelopment Server

```bash
npm run dev
```

The frontend will be live at http://localhost:3000.

## 📂 Project Structure

frontend/
├── app/ # Next.js App Router pages
├── components/ # Shared UI components (Scanner, Wallet, Map)
├── lib/
│ └── api.ts # Centralized API fetcher pointing to FastAPI backend
└── public/ # Static assets

## 🔌 Connecting to Backend API

All backend calls should go through frontend/lib/api.ts. It handles authorization headers automatically when tokens are stored in localStorage.
Example usage:
TypeScript
import { apiFetch } from '@/lib/api';

// Example: Fetch user profile
const profile = await apiFetch('/auth/me');

## ⚠️ Notes for Teammates

Make sure the FastAPI backend is running on http://localhost:8000 before running client interactions.
Clear browser localStorage if you run into authentication state issues during rapid testing.
