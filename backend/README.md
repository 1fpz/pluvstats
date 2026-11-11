# Backend — PLUVSTATS

API FastAPI + SQLite do protótipo. O backend é a fonte canônica quando o frontend define
`VITE_API_BASE_URL`; sem essa variável, o frontend opera apenas com o runtime demonstrativo local.

> Nenhum dado representa ocorrência oficial da Prefeitura de Santo André. O ambiente padrão é
> demonstração (`PLUVSTATS_ENV=demo`).

## Estrutura

```text
backend/
├── app/
│   ├── api/             routers HTTP por domínio
│   ├── core/            configuração e erros de domínio
│   ├── intelligence/    simulação, alertas, histerese, priorização e visão de sensores
│   ├── models/          schema SQLite e enumerações
│   ├── repositories/    acesso a dados explícito (sem ORM)
│   ├── schemas/         contratos Pydantic
│   ├── services/        regras de aplicação e composição
│   └── main.py          fábrica da aplicação
├── tests/               testes de integração e de regras
├── data/                banco SQLite local (não versionado)
└── requirements.txt
```

Os limiares vêm exclusivamente de `shared/pluvstats.config.json`, o mesmo arquivo usado pelo
frontend. Não há cópia de limiares no código.

## Instalação

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

## Execução

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000
```

- Documentação interativa: `http://127.0.0.1:8000/docs`
- Health check: `GET /api/health`
- Snapshot usado pelo frontend: `GET /api/snapshot`

O banco e o seed demonstrativo são criados automaticamente na primeira execução. Para restaurar
o estado inicial: `POST /api/demo/reset`.

## Endpoints principais

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/api/health` | estado do processo e do modo |
| GET | `/api/config` | configuração pública (sem segredos) |
| GET | `/api/snapshot` | estado completo para o frontend |
| GET/POST | `/api/occurrences` | listar e criar ocorrências |
| GET/PATCH/DELETE | `/api/occurrences/{id}` | consultar, atualizar e excluir |
| GET | `/api/sensors` | visão dos sensores com proveniência |
| GET | `/api/readings` | leituras com filtros |
| POST | `/api/hardware/readings` | ingestão física (desabilitada por padrão) |
| GET | `/api/alerts` | alertas com filtros |
| POST | `/api/alerts/{id}/acknowledge` | reconhecer alerta |
| POST | `/api/alerts/{id}/resolve` | encerrar alerta |
| GET/POST | `/api/interventions` | intervenções |
| PATCH | `/api/interventions/{id}` | atualizar intervenção |
| GET | `/api/simulation` | estado do simulador |
| POST | `/api/simulation/tick` | avançar um ciclo determinístico |
| POST | `/api/simulation/commands` | iniciar, pausar, cenário, ajustes e falhas |
| GET | `/api/analytics/summary` | indicadores agregados |
| GET | `/api/analytics/timeseries` | séries por sensor |
| GET | `/api/analytics/neighborhoods` | agregados por bairro |
| GET | `/api/analytics/sensors` | estatísticas de leitura |
| GET | `/api/analytics/priorities` | priorização explicável experimental |
| POST | `/api/demo/reset` | restaurar o seed demonstrativo |

## Hardware

A ingestão física é **desabilitada por padrão**. Para habilitar em ambiente de desenvolvimento:

```env
PLUVSTATS_HARDWARE_ENABLED=true
PLUVSTATS_HARDWARE_KEY=uma-chave-local
```

O dispositivo envia `X-Device-Key` e um corpo como:

```json
{
  "deviceId": "PLUV-ESP32-0001",
  "distanceCm": 70,
  "firmwareVersion": "0.1.0"
}
```

Regras aplicadas:

- o `deviceId` precisa estar cadastrado como `source = hardware`;
- a distância precisa estar em `thresholds.invalidDistanceRangeCm`;
- a altura da água é calculada por `sensorHeightCm - distanceCm`;
- leituras fora da faixa são gravadas para auditoria, mas não validam o dispositivo;
- apenas leitura válida e recente (`staleReadingSeconds`) marca `validated = true`;
- leitura antiga gera alerta de comunicação e não comprova conectividade.

O endpoint nunca aceita dados simulados como hardware. Nenhum dispositivo físico foi testado
neste projeto; habilitar a rota não cria uma alegação de conexão real.

## Testes

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
```

A suíte cobre health/configuração, snapshot, CRUD e validação de ocorrências, intervenções,
simulação e histerese, reconhecimento/resolução de alertas, hardware desabilitado/validado/
inválido/antigo, analytics e reset da demonstração.
