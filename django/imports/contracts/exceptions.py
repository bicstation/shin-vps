"""
SHIN CORE LINX
Import Contract Exceptions
"""


class ImportContractError(Exception):
    """
    Base exception for all Import Contract errors.
    """


class InvalidContractError(ImportContractError):
    """
    Contract does not conform to Import Contract Schema.
    """


class MissingSectionError(ImportContractError):
    """
    Required contract section is missing.

    Example
    -------
    identity
    commerce
    media
    observation
    """


class MissingFieldError(ImportContractError):
    """
    Required field is missing.
    """


class InvalidFieldTypeError(ImportContractError):
    """
    Field type does not match the Contract Schema.
    """


class DuplicateUniqueIDError(ImportContractError):
    """
    Duplicate unique_id detected inside one Import Contract.
    """


class ContractVersionError(ImportContractError):
    """
    Unsupported Import Contract version.
    """