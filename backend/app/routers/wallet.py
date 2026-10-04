from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models import User, WalletTransaction
from app.routers.auth import get_current_user
from app.schemas.contracts import (
    WalletOut,
    FinishScanSessionRequest,
    FinishScanSessionResponse,
)
from app.services.wallet_service import (
    get_or_create_wallet,
    credit_wallet_from_batch,
)

router = APIRouter(prefix="/wallet", tags=["Wallet"])

@router.get("", response_model=WalletOut)
def get_wallet(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_or_create_wallet(db, current_user.id)

@router.get("/transactions")
def get_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = get_or_create_wallet(db, current_user.id)
    return db.query(WalletTransaction).filter(WalletTransaction.wallet_id == wallet.id).all()


@router.post("/finish-session", response_model=FinishScanSessionResponse)
def finish_scan_session(
    payload: FinishScanSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    credited, new_balance = credit_wallet_from_batch(
        db=db,
        user_id=current_user.id,
        barcodes=payload.barcodes,
    )

    return FinishScanSessionResponse(
        message=f"Successfully added +{credited:.2f} PLN to your wallet.",
        credited_amount=credited,
        new_balance=new_balance,
    )
