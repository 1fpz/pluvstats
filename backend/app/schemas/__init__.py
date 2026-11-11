"""Pydantic contracts shared by the HTTP layer."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


def to_camel(value: str) -> str:
    head, *tail = value.split("_")
    return head + "".join(part.capitalize() for part in tail)


class APIModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,
        str_strip_whitespace=True,
    )


class InputModel(APIModel):
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,
        extra="forbid",
        str_strip_whitespace=True,
    )


class Position(APIModel):
    lat: float = Field(ge=-24.2, le=-23.2)
    lng: float = Field(ge=-47.1, le=-45.9)


class Message(APIModel):
    message: str
    detail: str | None = None


class HealthOut(APIModel):
    status: str
    version: str
    environment: str
    hardware_enabled: bool
    time: str


class ErrorOut(APIModel):
    detail: str | Any
