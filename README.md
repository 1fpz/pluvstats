# PLUVSTATS

**Inteligência territorial para águas urbanas** · _Dados que antecipam decisões._

Protótipo acadêmico e experimental de monitoramento de pontos de alagamento, com arquitetura modular
(frontend, backend, edge, matemática, design e documentação). O projeto não possui integração oficial
com a Prefeitura de Santo André e não substitui órgãos públicos.

## Estado do projeto

| Módulo | Estado |
| --- | --- |
| Estrutura do monorepo | Concluído |
| Design system | Concluído |
| Frontend demonstrativo (gestor e cidadão) | Concluído |
| Backend FastAPI + SQLite | Concluído |
| Simulador e motor de alertas | Concluído |
| Inteligência territorial experimental | Concluído |
| ESP32 | Firmware e diagrama prontos — **não compilados, não testados fisicamente** |
| Wokwi | Projeto pronto — **simulação não executada** |
| Módulo de matemática | Concluído (25 testes) |
| Documentação | Concluída |
| Pitch | Concluído |

Evidências automatizadas: **20 testes de frontend, 31 de backend, 25 de matemática e 4 de
sincronização de limiares**. Detalhes e o que não foi testado em
[documentation/testing](documentation/testing/README.md).

### Documentação principal

- [Arquitetura](documentation/architecture/overview.md)
- [Contrato da API](documentation/api/README.md)
- [Testes e evidências](documentation/testing/README.md)
- [Requisitos, personas e jornadas](design/README.md)
- [Pitch e slides](pitch/README.md)
- [Uso de IA](AI.md)

## Requisitos

- Node.js 20+
- Python 3.11+

## Desenvolvimento

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O ambiente padrão é **demonstração**: leituras, ocorrências e alertas são identificados como
simulados. Sem `VITE_API_BASE_URL`, o frontend usa o repositório demonstrativo local.

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000
```

Consulte `backend/README.md` para endpoints, regras de hardware e testes.

### Integração frontend + backend

Crie `frontend/.env` a partir de `frontend/.env.example` e defina:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

O frontend consulta a API ao iniciar. Se a API estiver ausente ou indisponível, ele retorna ao
runtime demonstrativo local e informa o fallback em **Diagnóstico**. Nenhuma credencial é enviada
ao navegador.

## Testes

```bash
cd frontend && npm run test && npm run lint && npm run build
cd backend && .\.venv\Scripts\python.exe -m pytest
cd .. && python -m unittest discover -s mathematics/tests -p "test_*.py"
python -m unittest discover -s edge/tools -p "test_*.py"
python edge/tools/sync_thresholds.py --check
```

O firmware ESP32 não é compilado nesta verificação e o diagrama do Wokwi não é
executado. Essas ausências são registradas em [edge/README.md](edge/README.md) e em
[documentation/testing](documentation/testing/README.md).

## Dados e segurança

- Todos os dados exibidos no modo demonstração são fictícios e identificados como tal.
- O modo hardware só é habilitado após leitura física recente, estruturalmente válida e confirmada
  pela API.
- A ingestão de hardware é desabilitada por padrão (`PLUVSTATS_HARDWARE_ENABLED=false`).
- Nenhum segredo, credencial real, entrevista ou teste físico é inventado neste repositório.
- Os limiares são definidos em `shared/pluvstats.config.json`, lido pelo frontend e pelo backend.

## Estrutura

```text
pluvstats/
├── frontend/       React + Vite + Tailwind + Recharts + Leaflet
├── backend/        FastAPI + SQLite (stdlib sqlite3)
├── edge/           ESP32 + Wokwi
├── mathematics/    fórmulas e limitações documentadas
├── shared/         configuração única compartilhada
├── design/         design system e identidade
├── documentation/  arquitetura, decisões e relatórios
└── pitch/          apresentação do projeto
```
