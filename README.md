# PLUVSTATS

**Inteligência territorial para águas urbanas** · _Dados que antecipam decisões._

Protótipo acadêmico e experimental de monitoramento de pontos de alagamento, com arquitetura modular
(frontend, backend, edge, matemática, design e documentação). O projeto não possui integração oficial
com a Prefeitura de Santo André e não substitui órgãos públicos.

> A documentação completa é publicada ao final da Fase 15. Este README é atualizado junto com as entregas.

## Estado do projeto

| Módulo | Estado |
| --- | --- |
| Estrutura do monorepo | Em andamento |
| Design system | Em andamento |
| Frontend (demonstração) | Em andamento |
| Backend FastAPI + SQLite | Planejado |
| Simulador e motor de alertas | Planejado |
| ESP32 / Wokwi | Planejado |
| Inteligência territorial | Planejado |

## Requisitos

- Node.js 20+
- Python 3.11+

## Desenvolvimento

```bash
cd frontend
npm install
npm run dev
```

O ambiente padrão é **demonstração**: leituras, ocorrências e alertas são identificados como simulados.
