# Kaucja Boys — Backend API

FastAPI service for the Kaucja Boys demo app. The backend provides authentication, wallet management, and seeded demo data used by the frontend.

## Stack

- Python 3.12+ via [uv](https://docs.astral.sh/uv/)
- FastAPI
- SQLAlchemy
- SQLite (development default)
- JWT authentication
- Pydantic settings

## Project structure

```text
backend/
├── app/
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── db/
│   │   ├── models.py
│   │   ├── session.py
│   │   └── __init__.py
│   ├── routers/
│   │   ├── auth.py
│   │   └── wallet.py
│   ├── schemas/
│   │   └── contracts.py
│   ├── services/
│   │   └── wallet_service.py
│   └── main.py
├── pyproject.toml
├── uv.lock
├── .python-version
└── README.md
```

## Current functionality

- User registration: `POST /auth/register`
- User login: `POST /auth/login`
- Current user: `GET /auth/me`
- Wallet summary: `GET /wallet`
- Wallet transactions: `GET /wallet/transactions`

The app also seeds a demo account automatically on startup:

- Email: `demo@kaucja.pl`
- Password: `password123`

## Quickstart

### 1. Prerequisites

Install [uv](https://docs.astral.sh/uv/getting-started/installation/). It provides Python 3.12 when the project pin in `.python-version` is not already installed.

### 2. Install dependencies

```bash
cd backend
uv sync
```

Runtime dependencies are declared in `pyproject.toml` and locked in `uv.lock`. Add a package with `uv add <package>` so the lockfile stays current.

### 3. Run the API

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

- http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database

The app uses SQLite by default for local development. The database file is created in the backend directory as `kaucja.db`.

Models include:

- `User`
- `Wallet`
- `WalletTransaction`
- `Voucher`

## Notes for contributors

- Do not commit `.venv/`, local SQLite database files, or Python bytecode artifacts.
- Keep API routes and wallet logic consistent with the frontend assumptions.
- If you add new endpoints, update the frontend API client usage accordingly.

## Example flow

1. Register or log in as a user.
2. Fetch protected wallet data from `/wallet`.
3. Use demo voucher codes seeded by the app for testing.
4. Manage wallet balances and transaction history from the frontend.
