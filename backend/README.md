# Backend — PLUVSTATS

FastAPI + SQLite. A implementação é entregue na Fase 11, mantendo a separação:

```text
backend/
├── api/            routers HTTP
├── models/         modelos de persistência
├── schemas/        contratos Pydantic
├── repositories/   acesso a dados
├── services/       regras de aplicação
├── intelligence/   motor de alertas e inteligência territorial
├── tests/          testes unitários e de integração
└── data/           banco SQLite local (não versionado)
```

A recepção de hardware e o simulador são endpoints distintos, com validação de origem e estrutura.
