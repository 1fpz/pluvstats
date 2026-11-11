"""FastAPI application factory.

Run locally with:

    uvicorn app.main:create_app --factory --reload

The factory keeps tests isolated: importing this module never opens the default
database or writes the demo seed.
"""

from __future__ import annotations

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import __version__
from app.api import alerts, analytics, demo, health, interventions, occurrences, readings, snapshot
from app.api import sensors as sensors_api
from app.api import simulation as simulation_api
from app.core.config import BACKEND_ROOT, Settings
from app.core.errors import DomainError
from app.services.container import ServiceContainer

DESCRIPTION = """
API do protótipo acadêmico PLUVSTATS.

- Ambiente padrão: demonstração com dados simulados.
- Hardware: desabilitado por padrão e validado apenas por leitura física recente.
- Limiares: lidos de `shared/pluvstats.config.json`, a mesma fonte do frontend.

Nenhum dado representa ocorrência oficial da Prefeitura de Santo André.
""".strip()


def create_app(settings: Settings | None = None) -> FastAPI:
    if settings is None:
        load_dotenv(BACKEND_ROOT / ".env")
        settings = Settings.from_env()

    container = ServiceContainer.build(settings)
    container.seed.ensure_seeded()

    app = FastAPI(
        title="PLUVSTATS API",
        description=DESCRIPTION,
        version=__version__,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )
    app.state.container = container
    app.state.settings = settings

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    @app.exception_handler(DomainError)
    async def domain_error_handler(_request: Request, exc: DomainError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

    @app.get("/", tags=["sistema"])
    def root() -> dict:
        return {
            "name": "PLUVSTATS API",
            "version": __version__,
            "environment": settings.environment,
            "mode": "demo" if settings.is_demo else "hardware",
            "docs": "/docs",
            "api": "/api",
        }

    for router in (
        health.router,
        snapshot.router,
        occurrences.router,
        sensors_api.router,
        readings.router,
        alerts.router,
        interventions.router,
        simulation_api.router,
        analytics.router,
        demo.router,
    ):
        app.include_router(router, prefix="/api")

    return app


if __name__ == "__main__":  # pragma: no cover - convenience entry point
    import uvicorn

    uvicorn.run(
        "app.main:create_app",
        factory=True,
        host="127.0.0.1",
        port=8000,
        reload=False,
    )
