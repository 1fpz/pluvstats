"""Small helpers shared by repositories and services."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone

_SEQUENTIAL = re.compile(r"^(?P<prefix>[A-Z]+)-(?P<year>\d{4})-(?P<number>\d+)$")


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso_now() -> str:
    return utc_now().isoformat()


def to_iso(value: datetime | str | None) -> str | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()
    return str(value)


def json_dump(value) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def json_load(value, fallback):
    if value is None or value == "":
        return fallback
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value)
    except (TypeError, ValueError):
        return fallback


def next_sequential_id(prefix: str, existing_ids: list[str], year: int | None = None) -> str:
    year = year or utc_now().year
    highest = 0
    for value in existing_ids:
        match = _SEQUENTIAL.match(value or "")
        if not match or match.group("prefix") != prefix or int(match.group("year")) != year:
            continue
        highest = max(highest, int(match.group("number")))
    return f"{prefix}-{year}-{highest + 1:04d}"


def create_entity_id(prefix: str) -> str:
    stamp = int(datetime.now(timezone.utc).timestamp() * 1000)
    return f"{prefix}-{base36(stamp)}-{base36(abs(hash((prefix, stamp))) % 1_000_000)}"


def base36(value: int) -> str:
    alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
    if value == 0:
        return "0"
    digits = []
    while value:
        value, remainder = divmod(value, 36)
        digits.append(alphabet[remainder])
    return "".join(reversed(digits))
