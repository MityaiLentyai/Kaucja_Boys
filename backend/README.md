# Kaucja Boys — Backend API

FastAPI service powering the universal deposit-voucher wallet, barcode claim verification, QR payment redemption, and machine mapping logic.

## 🛠️ Stack

- **Framework:** FastAPI (Python 3.10+)
- **ORM:** SQLAlchemy
- **Database:** SQLite (default for development: `kaucja.db`)
- **Authentication:** JWT + Passlib (bcrypt)
- **Settings Management:** Pydantic Settings

---

## 🚀 Quickstart Guide for Teammates

### 1. Prerequisites

Ensure you have Python 3.10+ installed on your system.

### 2. Setup Virtual Environment

From the project root:

```bash
cd backend
python3 -m venv venv

# Activate on Linux/macOS:
source venv/bin/activate

# Activate on Windows (CMD/PowerShell):
# venv\Scripts\activate
```

### 3. Install Dependecies

```bash
pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings python-jose passlib bcrypt python-multipart
```

### 4. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

`The server will be live at http://localhost:8000`

## 📑 Interactive API Documentation

Once the server is running, you can access the automatically generated interactive docs:

```
Swagger UI: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc
```

## 🗄️ Database Architecture

- Database tables are initialized automatically on startup (Base.metadata.create_all).
- users — Authentication & user roles (user, cashier, admin).
- wallets — One-to-one mapping with users tracking live balance.
- wallet_transactions — Immutable ledger recording top-ups, redemptions, and releases.
- vouchers — Deposit machine receipts & claim state.
- redemption_tokens — Short-lived signed tokens for dynamic payment QR generation.
- redemptions — Completed store cashier deductions.
- machines & machine_reviews — Deposit machine locations and community status reports.

## ⚠️ Notes for Teammates

- Do not commit .db or .pyc files. SQLite data files and compiled bytecode are ignored by Git.
- Default DB will be created locally as kaucja.db in the backend/ root directory.
