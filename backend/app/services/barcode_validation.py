from __future__ import annotations


SUPPORTED_LENGTHS = {8, 12, 13, 14}


def normalize_barcode(raw: str) -> str:
    return raw.strip()


def is_valid_barcode(raw: str) -> bool:
    """
    Validate UPC-A, EAN-8, EAN-13, and GTIN-14 check digits.

    This validates barcode structure and checksum. It does not verify
    that the barcode belongs to a real product database.
    """
    code = normalize_barcode(raw)

    if len(code) not in SUPPORTED_LENGTHS or not code.isdigit():
        return False

    body = code[:-1]
    check_digit = int(code[-1])

    weighted_sum = sum(
        int(digit) * (3 if index % 2 == 0 else 1)
        for index, digit in enumerate(reversed(body))
    )

    calculated_check_digit = (10 - (weighted_sum % 10)) % 10

    return calculated_check_digit == check_digit
