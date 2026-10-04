from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.contracts import ItemScanRequest, ItemScanResponse
from app.routers.auth import get_current_user
from app.db.models import User, WalletTransaction
from app.db.session import get_db

router = APIRouter(prefix="/items", tags=["items"])

KNOWN_ITEMS = {
    "5902448246222": {"name": "Strzal Energi 120ml", "deposit": 0.50},
    "5901234567890": {"name": "Żywiec Light Beer Bottle 0.5L", "deposit": 0.50},
    "5900001002003": {"name": "Coca-Cola Zero 0.33L Can", "deposit": 0.50},
    "5000112678062": {"name": "Coca-Cola Zero 0.33L Plastic Bottle", "deposit": 0.50},
}


@router.post("/scan", response_model=ItemScanResponse)
def scan_item(
    payload: ItemScanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    code = payload.barcode.strip()

    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Barcode cannot be empty."
        )

    existing_tx = (
        db.query(WalletTransaction).filter(WalletTransaction.source_id == code).first()
    )

    if existing_tx:
        return ItemScanResponse(
            is_valid=False,
            deposit_value=0.0,
            message="This item has already been recycled.",
        )

    if code.endswith("999") or code.endswith("BAD"):
        return ItemScanResponse(
            is_valid=False,
            deposit_value=0.0,
            message="Item rejected: Container shape is deformed or barcode is damaged.",
        )

    item = code
    return ItemScanResponse(
        is_valid=True,
        item_name=item["name"],
        deposit_value=item["deposit"],
        message="Item accepted.",
    )

    if code.startswith("590") or code.startswith("KAUCJA") or len(code) >= 8:
        return ItemScanResponse(
            is_valid=True,
            item_name=f"Recyclable Container ({code[-4:]})",
            deposit_value=0.50,
            message="Item accepted.",
        )

    return ItemScanResponse(
        is_valid=False,
        deposit_value=0.0,
        message="Unrecognized barcode or item not eligible for Kaucja deposit.",
    )
