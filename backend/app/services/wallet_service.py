from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.db.models import Wallet, WalletTransaction, TransactionType

def get_or_create_wallet(db: Session, user_id: str | int) -> Wallet:
    str_user_id = str(user_id)
    wallet = db.query(Wallet).filter(Wallet.user_id == str_user_id).first()
    if not wallet:
        wallet = Wallet(user_id=str_user_id, balance=0.0)
        db.add(wallet)
        db.flush()
    return wallet

def record_transaction(
    db: Session,
    user_id: str | int,
    amount: float,
    type_: TransactionType,
    source_type: str,
    source_id: str = None,
    description: str = None,
    commit: bool = True
) -> WalletTransaction:
    str_user_id = str(user_id)
    wallet = get_or_create_wallet(db, str_user_id)

    if type_ == TransactionType.TOPUP:
        wallet.balance += amount
    elif type_ == TransactionType.REDEEM:
        if wallet.balance < amount:
            raise ValueError("Insufficient wallet balance")
        wallet.balance -= amount

    tx = WalletTransaction(
        wallet_id=wallet.id,
        user_id=str_user_id,
        type=type_,
        amount=amount,
        source_type=source_type,
        source_id=source_id,
        description=description
    )
    db.add(tx)

    if commit:
        db.commit()
        db.refresh(tx)

    return tx

def credit_wallet_from_batch(
    db: Session,
    user_id: str | int,
    barcodes: list[str]
) -> tuple[float, float]:
    if not barcodes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch contains no items to scan."
        )

    str_user_id = str(user_id)

    existing_tx = db.query(WalletTransaction).filter(
        WalletTransaction.source_id.in_(barcodes)
    ).first()

    if existing_tx:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Item {existing_tx.source_id} has already been recycled."
        )

    total_amount = len(barcodes) * 0.50

    for barcode in barcodes:
        record_transaction(
            db=db,
            user_id=str_user_id,
            amount=0.50,
            type_=TransactionType.TOPUP,
            source_type="item_recycling",
            source_id=barcode,
            description=f"Recycled item {barcode}",
            commit=False
        )

    try:
        db.commit()
    except Exception as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to finalize recycling batch. Transaction rolled back."
        )

    wallet = get_or_create_wallet(db, str_user_id)
    return total_amount, wallet.balance
