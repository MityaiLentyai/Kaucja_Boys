# Kaucja Boys — Frontend Web App

Next.js frontend for the Kaucja Boys universal deposit-wallet demo. The app provides the user-facing flow for signing in, viewing a wallet balance, scanning deposit vouchers, and starting QR-based payments.

## Stack

- Next.js `16.3.8` with the App Router
- React `19`
- TypeScript
- Tailwind CSS `4`
- `@zxing/browser` for barcode scanning
- `react-qr-code` for QR-code rendering
- Lucide React for icons

## Project structure

```text
frontend/
├── app/
│   ├── dashboard/       # Authenticated wallet dashboard
│   ├── login/           # Login page
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout and metadata
│   └── page.tsx         # Landing page
├── lib/
│   ├── api.ts           # API client for the FastAPI backend
│   └── auth.ts          # Client-side authentication helpers
├── public/              # Static assets
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## Current application flow

1. Open the landing page at `/`.
2. Navigate to `/login` and authenticate with the backend.
3. The dashboard at `/dashboard` loads the current user and wallet through the API client.
4. Use the dashboard actions to continue to voucher scanning or QR payment flows as those screens are implemented.

The dashboard currently displays:

- The authenticated user's name or email
- The current wallet balance in PLN
- Navigation to voucher scanning
- Navigation to QR payment

## Quickstart

### 1. Prerequisites

Install Node.js 18 or newer and npm.

### 2. Install dependencies

From the repository root:

```bash
cd frontend
npm install
```

### 3. Configure the backend URL

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The backend must be running at this URL for login and dashboard requests to work.

### 4. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Available scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Serve the production build
npm run lint     # Run ESLint
```

## API integration

Frontend requests should use `frontend/lib/api.ts` rather than calling `fetch` directly. The helper uses `NEXT_PUBLIC_API_URL` as the base URL and adds the stored bearer token to authenticated requests.

Example:

```tsx
import { apiFetch } from "@/lib/api";

const profile = await apiFetch("/auth/me");
const wallet = await apiFetch("/wallet");
```

The current dashboard uses these backend endpoints:

- `GET /auth/me`
- `GET /wallet`

Authentication requests are handled through the `/auth` endpoints exposed by the backend.

## Local development with the backend

Run the backend in a separate terminal:

```bash
cd backend
source venv/bin/activate       # Linux/macOS
# venv\Scripts\activate        # Windows
uvicorn app.main:app --reload --port 8000
```

Then start the frontend:

```bash
cd frontend
npm run dev
```

For the seeded demo account, see [`backend/README.md`](../backend/README.md).

## Troubleshooting

- If API requests fail, verify that the backend is running on port `8000`.
- If the frontend uses an incorrect API URL, check `frontend/.env.local` and restart the dev server.
- If authentication appears stuck during testing, clear the app's browser `localStorage` and log in again.
- Camera-based scanning requires browser permission and normally works best in a secure context such as HTTPS or localhost.

## Notes for contributors

- Keep frontend API calls centralized in `lib/api.ts`.
- Keep secrets out of client-side environment variables; only values prefixed with `NEXT_PUBLIC_` are exposed to the browser.
- Run `npm run lint` before committing frontend changes.
