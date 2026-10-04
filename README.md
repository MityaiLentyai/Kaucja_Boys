# KauCash 🐮

**Kaucja that works everywhere.**

KauCash is a universal digital wallet for Poland’s bottle-and-can deposit (kaucja). Store-specific slips from Biedronka, Lidl, or Żabka become one PLN balance you can spend at any participating checkout.

Built by **Kaucja Boys** · 42 Warsaw.

---

## The problem

Deposit value is locked to the chain that printed the slip. The proof is a scrap of paper that is easy to lose and quick to expire. Finding a machine that actually works is guesswork.

## What you can do

1. **Scan a slip** — camera or manual entry. A voucher is claimed once and credited to your wallet.
2. **Scan bottles at home** — eligible containers go into a return batch. The deposit is credited now; you have 48 hours to take them back.
3. **Pay with QR** — show a one-time code at any participating checkout.
4. **Find a machine** — nearby return points with status (working, queue, out of order), what they accept, and directions.

Accounts, balances, voucher claims, and item credits are persisted. Claims and recycled barcodes cannot be reused.

---

## Try it

|            |                                                                        |
| ---------- | ---------------------------------------------------------------------- |
| App        | [kaucja-boys.vercel.app](https://kaucja-boys.vercel.app)               |
| Demo login | `demo@kaucja.pl` / `password123`                                       |
| Demo slips | `KAUCJA-100` (10 PLN) · `KAUCJA-050` (5 PLN) · `KAUCJA-025` (2.50 PLN) |

Register a new account, or use the demo user. After sign-in the dashboard shows the wallet, return batches, and the four actions above.

---

## How it is built

```
Next.js (App Router)  →  FastAPI + JWT  →  SQLite / Postgres
```

| Surface                | What it does                                |
| ---------------------- | ------------------------------------------- |
| Landing & how-it-works | Product story and the four-step flow        |
| Auth                   | Register, login, JWT session                |
| Wallet                 | Single PLN balance and return-batch cards   |
| `/scan`                | Barcode / QR voucher claim → wallet top-up  |
| `/itemscan`            | Bottle & can session → batch credit         |
| `/pay`                 | One-time payment QR for the cashier         |
| `/returnpoints`        | Map of nearby machines and community status |

Frontend: Next.js, React, Tailwind, ZXing (camera scan), Leaflet (map).
Backend: FastAPI, SQLAlchemy, JWT. Vouchers are single-use; item barcodes and wallet moves are written to an append-only ledger.

---

## Run locally

**API** (needs [uv](https://docs.astral.sh/uv/)):

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**App:**

```bash
cd frontend
npm install
# .env.local → NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). API docs: [http://localhost:8000/docs](http://localhost:8000/docs).
