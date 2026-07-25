"""
SHIN CORE LINX
Import Contract Validator
"""

from __future__ import annotations

from .exceptions import (
    InvalidContractError,
    MissingFieldError,
    MissingSectionError,
)


REQUIRED_SECTIONS = (
    "identity",
    "commerce",
    "media",
    "observation",
)

REQUIRED_IDENTITY = (
    "unique_id",
    "maker",
    "product_name",
)

REQUIRED_COMMERCE = (
    "price",
    "currency",
)

REQUIRED_MEDIA = (
    "image_url",
    "images",
)


class ImportContractValidator:
    """
    Validate Import Contract.

    Responsibility
    --------------
    Ensure every Import Contract follows the SHIN CORE LINX
    Contract Schema.
    """

    def validate(self, contract: dict) -> None:

        if not isinstance(contract, dict):
            raise InvalidContractError(
                "Contract must be a dictionary."
            )

        self._validate_sections(contract)
        self._validate_identity(contract["identity"])
        self._validate_commerce(contract["commerce"])
        self._validate_media(contract["media"])

    def _validate_sections(self, contract: dict) -> None:

        for section in REQUIRED_SECTIONS:

            if section not in contract:
                raise MissingSectionError(section)

    def _validate_identity(self, identity: dict) -> None:

        for field in REQUIRED_IDENTITY:

            if not identity.get(field):
                raise MissingFieldError(
                    f"identity.{field}"
                )

    def _validate_commerce(self, commerce: dict) -> None:

        for field in REQUIRED_COMMERCE:

            if field not in commerce:
                raise MissingFieldError(
                    f"commerce.{field}"
                )

    def _validate_media(self, media: dict) -> None:

        for field in REQUIRED_MEDIA:

            if field not in media:
                raise MissingFieldError(
                    f"media.{field}"
                )