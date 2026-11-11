"""Domain errors translated to HTTP responses by the API layer."""

from __future__ import annotations


class DomainError(Exception):
    def __init__(self, message: str, *, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class NotFoundError(DomainError):
    def __init__(self, message: str = "Recurso não encontrado.") -> None:
        super().__init__(message, status_code=404)


class ConflictError(DomainError):
    def __init__(self, message: str) -> None:
        super().__init__(message, status_code=409)


class HardwareDisabledError(DomainError):
    def __init__(self) -> None:
        super().__init__(
            "A ingestão de hardware está desabilitada. Nenhum dispositivo físico foi validado "
            "para este ambiente. Habilite PLUVSTATS_HARDWARE_ENABLED apenas após a validação.",
            status_code=503,
        )


class UnauthorizedDeviceError(DomainError):
    def __init__(self) -> None:
        super().__init__("Credencial de dispositivo ausente ou inválida.", status_code=401)
