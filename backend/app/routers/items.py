from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.contracts import ItemScanRequest, ItemScanResponse
from app.routers.auth import get_current_user  # adjust import according to your auth dependency
from app.db.models import User

router = APIRouter(prefix="/items", tags=["items"])

# Known deposit-eligible database items
KNOWN_ITEMS = {
    "5902448246222": {"name": "Strzal Energi 120ml", "deposit": 0.50},
    "5901234567890": {"name": "Żywiec Light Beer Bottle 0.5L", "deposit": 0.50},
    "5900001002003": {"name": "Coca-Cola Zero 0.33L Can", "deposit": 0.50},
    "5000112678062": {"name": "Coca-Cola Zero 0.33L Plastic Bottle", "deposit": 0.50},
}

@router.post("/scan", response_model=ItemScanResponse)
def scan_item(
    payload: ItemScanRequest,
    current_user: User = Depends(get_current_user)
):
    code = payload.barcode.strip()

    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Barcode cannot be empty."
        )

    # 1. Simulate shape/deformation check (barcodes ending in '999' or 'BAD' represent damaged items)
    if code.endswith("999") or code.endswith("BAD"):
        return ItemScanResponse(
            is_valid=False,
            deposit_value=0.0,
            message="Item rejected: Container shape is deformed or barcode is damaged."
        )

    # 2. Match against known catalog or general Polish EAN deposit format (starts with '590' or 'KAUCJA')
    if code in KNOWN_ITEMS:
        item = KNOWN_ITEMS[code]
        return ItemScanResponse(
            is_valid=True,
            item_name=item["name"],
            deposit_value=item["deposit"],
            message="Item accepted."
        )

    if code.startswith("590") or code.startswith("KAUCJA") or len(code) >= 8:
        return ItemScanResponse(
            is_valid=True,
            item_name=f"Recyclable Container ({code[-4:]})",
            deposit_value=0.50,
            message="Item accepted."
        )

    return ItemScanResponse(
        is_valid=False,
        deposit_value=0.0,
        message="Unrecognized barcode or item not eligible for Kaucja deposit."
    )
