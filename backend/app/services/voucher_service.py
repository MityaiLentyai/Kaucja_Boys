from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime

from app.db.models import Voucher, VoucherStatus, TransactionType
from app.services.wallet_service import record_transaction, get_or_create_wallet

def process_voucher_claim(db: Session, user_id: str, barcode: str) -> dict:
    normalized_barcode = barcode.strip()

    voucher = db.query(Voucher).filter(Voucher.code == normalized_barcode).first()

    if not voucher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voucher not found or invalid barcode."
        )

    if voucher.status == VoucherStatus.CLAIMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This voucher has already been claimed."
        )

    if voucher.status == VoucherStatus.INVALID or voucher.status == VoucherStatus.REDEEMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This voucher is inactive or invalid."
        )

    # Mark voucher as claimed
    voucher.status = VoucherStatus.CLAIMED
    voucher.claimed_by_user_id = user_id
    voucher.claimed_at = datetime.utcnow()
    voucher.raw_scan_payload = barcode

    # Record transaction and top up wallet balance
    tx = record_transaction(
        db=db,
        user_id=user_id,
        amount=voucher.amount,
        type_=TransactionType.TOPUP,
        source_type="voucher",
        source_id=voucher.id,
        description=f"Voucher deposit ({voucher.issuer_store})"
    )

    wallet = get_or_create_wallet(db, user_id)

    return {
        "message": "Voucher processed successfully!",
        "voucher_code": voucher.code,
        "amount": voucher.amount,
        "issuer_store": voucher.issuer_store,
        "new_balance": wallet.balance
    }
