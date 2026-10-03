from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.db.models import Wallet, WalletTransaction, TransactionType

def get_or_create_wallet(db: Session, user_id: str) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet

def record_transaction(
    db: Session,
    user_id: str,
    amount: float,
    type_: TransactionType,
    source_type: str,
    source_id: str = None,
    description: str = None
) -> WalletTransaction:
    wallet = get_or_create_wallet(db, user_id)

    if type_ == TransactionType.TOPUP:
        wallet.balance += amount
    elif type_ == TransactionType.REDEEM:
        if wallet.balance < amount:
            raise ValueError("Insufficient wallet balance")
        wallet.balance -= amount

    tx = WalletTransaction(
        wallet_id=wallet.id,
        user_id=user_id,
        type=type_,
        amount=amount,
        source_type=source_type,
        source_id=source_id,
        description=description
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

def credit_wallet_from_batch(
    db: Session,
    user_id: str,
    barcodes: list[str]
) -> tuple[float, float]:
    if not barcodes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch contains no items to scan."
        )

    # 1. Check if any barcode in this batch was already redeemed in the DB
    existing_tx = db.query(WalletTransaction).filter(
        WalletTransaction.source_id.in_(barcodes)
    ).first()

    if existing_tx:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch contains already scanned items"
        )

    total_amount = len(barcodes) * 0.50

    # 2. Record individual transaction per barcode for duplicate tracking
    for barcode in barcodes:
        record_transaction(
            db=db,
            user_id=user_id,
            amount=0.50,
            type_=TransactionType.TOPUP,
            source_type="item_recycling",
            source_id=barcode,
            description=f"Recycled item {barcode}"
        )

    wallet = get_or_create_wallet(db, user_id)
    return total_amount, wallet.balance
