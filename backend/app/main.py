from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.db.session import engine, Base, SessionLocal
from app.routers import auth, wallet, vouchers, items
from app.db.models import User, UserRole, Voucher, VoucherStatus
from app.core.security import get_password_hash

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kaucja Boys Universal Wallet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(wallet.router)
app.include_router(vouchers.router)
app.include_router(items.router)

@app.on_event("startup")
def seed_demo_data():
    db: Session = SessionLocal()
    try:
        # Seed test user
        if not db.query(User).filter(User.email == "demo@kaucja.pl").first():
            demo_user = User(
                email="demo@kaucja.pl",
                password_hash=get_password_hash("password123"),
                full_name="Demo User",
                role=UserRole.USER
            )
            db.add(demo_user)
            db.commit()

        # Seed test vouchers
        if not db.query(Voucher).filter(Voucher.code == "KAUCJA-100").first():
            vouchers = [
                Voucher(code="KAUCJA-100", amount=10.0, issuer_store="Biedronka", status=VoucherStatus.NEW),
                Voucher(code="KAUCJA-050", amount=5.0, issuer_store="Lidl", status=VoucherStatus.NEW),
            ]
            db.add_all(vouchers)
            db.commit()
    finally:
        db.close()
