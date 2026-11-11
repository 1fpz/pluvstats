# Arquitetura — PLUVSTATS

Documento de referência da estrutura modular, dos contratos de dados e dos limites
conhecidos. Complementa o [ADR-001](../decisions/ADR-001-monorepo-modular.md).

## 1. Contexto

PLUVSTATS é um protótipo acadêmico de monitoramento de pontos de alagamento em
Santo André/SP. A entrega cobre:

- interface de gestão e área do cidadão;
- backend FastAPI com persistência SQLite;
- runtime demonstrativo local, executável sem backend;
- firmware ESP32 preparado para um sensor ultrassônico;
- modelo matemático de nível, taxa e tempo até o limite;
- documentação, design e roteiro de apresentação.

O projeto **não** tem integração oficial com a Prefeitura, Defesa Civil ou qualquer
central de emergência. Nenhum dado físico foi validado em campo.

## 2. Princípios

1. **Demonstração é o padrão.** O sistema inicia em modo demonstrativo, com dados
   fictícios identificados.
2. **Hardware não é inferido.** Um dispositivo só é considerado validado após uma
   leitura física recente e estruturalmente válida.
3. **Uma fonte para os limiares.** `shared/pluvstats.config.json` é lido pelo
   frontend, pelo backend e usado para gerar o header do firmware.
4. **Responsabilidades separadas.** Interface, domínio, persistência, borda e
   matemática têm contratos explícitos.
5. **Degradação honesta.** Sem API, o frontend continua funcional no runtime local e
   informa a origem dos dados.
6. **Sem segredos no cliente.** O navegador recebe apenas configuração pública.

## 3. Visão de módulos

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         shared/pluvstats.config.json                 │
│        limiares · geometria · território · cenários · operação       │
└───────────────┬───────────────────────┬──────────────────────────────┘
                │                       │
                ▼                       ▼
┌───────────────────────────┐   ┌──────────────────────────────────────┐
│ frontend/                 │   │ backend/                             │
│ React + Vite              │   │ FastAPI + SQLite                     │
│                           │   │                                      │
│ pages / components        │   │ api/          routers HTTP           │
│ contexts / hooks          │   │ services/     casos de uso           │
│ services/dataSource.js    │◄──┤ intelligence/ regras puras           │
│   ├── demoRepository      │   │ repositories/ acesso explícito       │
│   └── apiRepository       │   │ schemas/      contratos Pydantic     │
│ domain/ motores puros     │   │ models/       schema SQLite          │
└───────────────────────────┘   └──────────────────────────────────────┘
                ▲                               ▲
                │                               │
                │                    ┌──────────┴───────────┐
                │                    │ edge/ ESP32          │
                │                    │ HC-SR04 + LEDs       │
                │                    │ classificação local  │
                │                    └──────────┬───────────┘
                │                               │ HTTP opcional
                │                    ┌──────────┴───────────┐
                └────────────────────┤ mathematics/         │
                                     │ fórmulas e cenários  │
                                     └──────────────────────┘
```

## 4. Responsabilidades

### Frontend

| Camada | Responsabilidade | Exemplos |
| --- | --- | --- |
| `app/` | composição de rotas e providers | `App.jsx`, `providers.jsx` |
| `layouts/` | cascas de gestão e cidadão | `AppLayout`, `CitizenLayout` |
| `pages/` | composição de telas | `OverviewPage`, `CitizenMapPage` |
| `components/` | UI reutilizável | `StatCard`, `OccurrenceForm`, `AlertCard` |
| `contexts/` | estado de aplicação | `DataContext`, `SimulationContext` |
| `hooks/` | comportamento reutilizável | `useWeather`, `useMediaQuery` |
| `services/` | acesso a dados e integrações | `dataSource`, `apiRepository`, `weatherService` |
| `domain/` | regras puras, sem React | simulador, alertas, pontuação |
| `config/` | leitura do JSON compartilhado | `appConfig`, `runtimeConfig` |

A interface **nunca** importa `demoRepository` ou `apiRepository` diretamente. Todo
acesso passa por `services/dataSource.js`, que escolhe o adaptador e publica a origem
ativa (`kind: "demo" | "api"`).

### Backend

| Camada | Responsabilidade |
| --- | --- |
| `api/` | routers finos, validação de transporte e tradução de erros |
| `services/` | casos de uso, transações entre repositórios e auditoria |
| `intelligence/` | funções puras: alertas, histerese, simulação, priorização e visão de sensores |
| `repositories/` | SQL explícito com `sqlite3`; sem ORM |
| `schemas/` | contratos Pydantic de entrada e saída |
| `models/` | DDL, enums e ranks de severidade |
| `core/` | configuração e erros de domínio |

O container de serviços (`services/container.py`) é o único ponto de composição.
`create_app()` recebe `Settings` e permite que os testes usem um banco temporário sem
tocar no banco padrão.

### Edge

O firmware é independente do frontend e do backend. Ele:

- mede distância, usa mediana de cinco amostras e valida a faixa;
- calcula `h = H - d` e uma taxa em janela de 10–60 s;
- classifica localmente com histerese;
- aciona LEDs e buzzer;
- imprime telemetria JSON;
- opcionalmente envia HTTP para o backend, com credencial local.

Os limiares são gerados por `edge/tools/sync_thresholds.py`; um teste falha se o
header commitado divergir do JSON compartilhado.

### Matemática

`mathematics/model/pluvstats_model.py` é a referência legível das fórmulas:

- `h(t) = H - d(t)`;
- `v = Δh / Δt`;
- `t = (h_limite - h_atual) / v`;
- projeção linear e tendência por mínimos quadrados.

O módulo **não** é importado em tempo de execução pelo frontend ou pelo backend. Ele
documenta e testa as mesmas fórmulas usadas nos outros módulos.

## 5. Fluxos de dados

### 5.1 Gestão — demonstração local

```text
UI → DataContext → dataSource → demoRepository → localStorage
                                   │
                                   ├── simulationEngine (ticks de 5 s)
                                   └── alertEngine (histerese)
```

- Chave de persistência: `pluvstats.demo.state.v2`.
- O simulador inicia em execução, cenário `normal`.
- Leituras, alertas e ocorrências carregam `source: "simulation"` ou
  `origin: "demonstration"`.

### 5.2 Gestão — API

```text
UI → DataContext → dataSource → apiRepository → FastAPI → services → SQLite
```

- `apiRepository` consulta `GET /api/snapshot` na inicialização.
- O snapshot inclui sensores, ocorrências, intervenções, alertas, leituras e
  simulação.
- Se a API estiver ausente ou não responder, o adaptador local assume e o motivo
  aparece em **Diagnóstico**.

### 5.3 Cidadão

```text
Área do cidadão → DataContext → dataSource
                       │
                       ├── mapa de atenção (ocorrências + sensores)
                       └── registro simplificado → createOccurrence()
```

O cidadão não acessa controles de simulador, hardware ou diagnóstico. O registro não
pede dados pessoais e não aciona equipes.

### 5.4 Hardware

```text
ESP32 → POST /api/hardware/readings (X-Device-Key) → HardwareReadingService
                                                        ├── valida device e faixa
                                                        ├── grava leitura (auditoria)
                                                        ├── atualiza sensor
                                                        └── reconcilia alertas
```

Regras:

- rota desabilitada por padrão (`PLUVSTATS_HARDWARE_ENABLED=false`);
- `deviceId` precisa existir com `source = hardware`;
- distância fora de `invalidDistanceRangeCm` é auditada, mas não valida o dispositivo;
- leitura válida e recente (`staleReadingSeconds`) marca `validated = true`;
- leitura antiga gera alerta de comunicação;
- sensor simulado nunca aceita ingestão de hardware.

## 6. Contrato de dados

O `snapshot` é o read model compartilhado. Campos relevantes:

| Campo | Significado |
| --- | --- |
| `version` | versão do formato do snapshot |
| `sensors[]` | visão derivada dos sensores, com `source`, `status`, `validated`, `levelCm`, `quality` |
| `occurrences[]` | ocorrências demonstrativas |
| `interventions[]` | intervenções e vínculo com ocorrência |
| `alerts[]` | alertas com severidade, status, métricas e timeline |
| `simulation` | cenário, execução, contagem de ticks e sensores simulados |
| `readings` | última leitura por sensor |
| `activity[]` | trilha de auditoria recente |
| `sourceKind` | `demo` ou `api` |
| `isDemo` | ambiente demonstrativo |
| `counts` | contadores derivados para a interface |

Proveniência:

- `source: "simulation"` — gerado pelo simulador;
- `source: "hardware"` — originado de um dispositivo físico;
- `origin: "demonstration"` — ocorrência/intervenção fictícia;
- `simulated: true/false` — presente em leituras e alertas;
- `validated` — só verdadeiro para hardware com leitura recente e válida.

## 7. Limiares e alertas

Limiares atuais (demonstração):

| Faixa | Nível | Taxa |
| --- | --- | --- |
| atenção | 25 cm | 1,2 cm/min |
| alerta | 50 cm | 2,8 cm/min |
| crítico | 75 cm | 4,5 cm/min |

Histerese: 4 cm e 0,4 cm/min. A regra evita alternância de severidade perto do
limite: uma leitura menor mantém a severidade anterior enquanto estiver dentro da
banda.

O motor é determinístico e explicável. Cada alerta carrega `metrics`, `reading` e
`timeline`. Alertas são encerrados automaticamente quando a condição normaliza.

## 8. Segurança e privacidade

- Nenhuma credencial é enviada ao navegador; apenas `VITE_*` públicos.
- A chave de dispositivo fica no backend (`PLUVSTATS_HARDWARE_KEY`) e em
  `secrets.h` local, nunca versionado.
- CORS é restrito às origens configuradas.
- O modo demonstrativo não pede dados pessoais.
- O registro do cidadão é local ao ambiente e não é um protocolo oficial.
- Não há autenticação de usuários nesta entrega. O painel de gestão é um protótipo
  sem controle de acesso; isso é uma lacuna explícita, não uma decisão de produção.

## 9. Decisões e lacunas

Decisões registradas:

- [ADR-001 — monorepo modular](../decisions/ADR-001-monorepo-modular.md).

Lacunas conhecidas:

- sem autenticação/autorização;
- sem migrações de banco; o schema é criado de forma idempotente;
- sem deploy, observabilidade ou fila;
- sem integração oficial ou importação de dados municipais;
- sem Supabase; o backend usa SQLite;
- bundle do frontend acima de 500 kB, sem code splitting;
- nenhum teste físico, de carga, de acessibilidade com usuários ou de segurança
  ofensiva;
- Wokwi preparado, mas não executado.

O detalhamento de testes e evidências está em
[documentation/testing](../testing/README.md).
