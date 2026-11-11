# API — PLUVSTATS

API FastAPI do protótipo. Base local: `http://127.0.0.1:8000`. Documentação
interativa em `/docs` e contrato OpenAPI em `/openapi.json`.

> Todos os dados do ambiente padrão são demonstrativos. Nenhuma rota representa
> ocorrência oficial, previsão de enchente ou acionamento de equipes.

## Convenções

- Rotas sob `/api`.
- JSON em `camelCase` (os modelos Pydantic usam aliases).
- Datas em ISO 8601 com fuso.
- Erros de domínio retornam `{"detail": "mensagem"}`.
- Erros de validação do Pydantic retornam `422` com a lista padrão do FastAPI.
- `extra="forbid"` nos corpos de entrada: campos desconhecidos são rejeitados.

## Sistema

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/` | identidade da API, modo e links |
| GET | `/api/health` | estado do processo, versão e hardware habilitado |
| GET | `/api/config` | configuração pública e runtime, sem segredos |
| GET | `/api/snapshot` | read model completo para o frontend |
| GET | `/api/demo/status` | contagens do seed e modo |
| POST | `/api/demo/reset` | restaura o seed demonstrativo |

Exemplo:

```bash
curl http://127.0.0.1:8000/api/health
```

```json
{
  "status": "ok",
  "version": "0.1.0",
  "environment": "demo",
  "hardwareEnabled": false,
  "time": "2026-11-11T18:01:29+00:00"
}
```

## Ocorrências

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/occurrences` | lista com filtros |
| GET | `/api/occurrences/{id}` | detalhe |
| POST | `/api/occurrences` | cria ocorrência demonstrativa |
| PATCH | `/api/occurrences/{id}` | atualização parcial |
| DELETE | `/api/occurrences/{id}` | remove |

Filtros de lista: `query`, `status`, `severity`, `neighborhood`, `limit`
(1–1000), `offset`.

Corpo de criação:

```json
{
  "title": "Acúmulo de água na Rua das Acácias",
  "type": "waterlogging",
  "status": "open",
  "severity": "attention",
  "position": { "lat": -23.6607, "lng": -46.5331 },
  "address": "Rua das Acácias, 120",
  "neighborhood": "Centro",
  "description": "Água cobrindo metade da via após chuva forte, dificultando a passagem.",
  "reportedAt": "2026-11-11T12:00:00-03:00",
  "recurrenceCount": 1,
  "affectedPeopleEstimate": 12,
  "reporter": "Canal do cidadão (demonstração)",
  "evidence": ["Registro de teste"]
}
```

Regras:

- `title` 8–140 caracteres;
- `description` 20–800 caracteres;
- `position` restrita à caixa do território demonstrativo;
- `sensorId`, quando informado, precisa existir;
- o `id` é sequencial (`OCO-2026-0149`) e `origin` é `demonstration`;
- `reportedAt` aceita ISO 8601 e é normalizado para UTC.

## Sensores e leituras

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/sensors` | visão dos sensores com proveniência |
| GET | `/api/sensors/{id}` | um sensor |
| GET | `/api/readings` | leituras com filtros |
| POST | `/api/hardware/readings` | ingestão física (desabilitada por padrão) |

Filtros de leituras: `sensorId`, `source`, `quality`, `since`, `limit`
(1–2000).

A visão do sensor inclui `source`, `status`, `validated`, `levelCm`,
`connectivityProof` e `readingAgeSeconds`. Sensor de hardware sem leitura
recente permanece `hardware_unvalidated` ou `hardware_stale`, nunca
“conectado”.

### Ingestão de hardware

Habilitar apenas em ambiente controlado:

```env
PLUVSTATS_HARDWARE_ENABLED=true
PLUVSTATS_HARDWARE_KEY=uma-chave-local
```

```bash
curl -X POST http://127.0.0.1:8000/api/hardware/readings \
  -H "Content-Type: application/json" \
  -H "X-Device-Key: uma-chave-local" \
  -d '{"deviceId":"PLUV-ESP32-0001","distanceCm":70,"firmwareVersion":"0.1.0"}'
```

Resposta (201):

```json
{
  "accepted": true,
  "sensorId": "PS-05",
  "deviceId": "PLUV-ESP32-0001",
  "quality": "valid",
  "status": "hardware_validated",
  "validated": true,
  "distanceCm": 70.0,
  "waterLevelCm": 50.0,
  "timestamp": "2026-11-11T18:01:53Z",
  "alerts": { "created": ["ALT-PS-05-water_level-..."], "updated": [] },
  "message": "Leitura física registrada e considerada válida para operação."
}
```

Regras de validação:

- rota retorna `503` quando `PLUVSTATS_HARDWARE_ENABLED` é falso;
- `401` quando a chave configurada não confere;
- `404` para `deviceId` desconhecido;
- `409` se o `deviceId` pertencer a um sensor simulado;
- distância fora de `invalidDistanceRangeCm` é gravada para auditoria, mas não
  valida o dispositivo;
- leitura mais antiga que `staleReadingSeconds` não comprova conectividade;
- `waterLevelCm` é derivado de `sensorHeightCm - distanceCm`; o cliente não
  escolhe o nível.

Enviar um payload sintético testa o contrato, **não** valida um dispositivo
físico. Para testes, use um banco descartável.

## Alertas

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/alerts` | lista com filtros |
| GET | `/api/alerts/{id}` | detalhe |
| POST | `/api/alerts/{id}/acknowledge` | reconhece |
| POST | `/api/alerts/{id}/resolve` | encerra manualmente |

Filtros: `status`, `severity`, `source`, `type`, `limit`.

Cada alerta contém `metrics`, `reading`, `timeline`, `simulated` e
`resolvedAutomatically`. O motor abre, escalona e encerra alertas com histerese.
`acknowledge` e `resolve` retornam `409` para alerta já encerrado e `404` para
id inexistente.

## Intervenções

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/interventions` | lista |
| GET | `/api/interventions/{id}` | detalhe |
| POST | `/api/interventions` | cria |
| PATCH | `/api/interventions/{id}` | atualiza |

Uma intervenção concluída exige `afterLevelCm` e `completedAt`. O vínculo com
ocorrência é opcional, mas precisa apontar para uma ocorrência existente.

## Simulação

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/simulation` | estado atual |
| POST | `/api/simulation/tick` | avança um ciclo determinístico |
| POST | `/api/simulation/commands` | aplica um comando |

Comandos aceitos:

```json
{ "action": "set_level", "sensorId": "PS-01", "amountCm": 80 }
```

```json
{ "action": "set_scenario", "scenario": "critical" }
```

Ações: `start`, `pause`, `reset`, `set_scenario`, `raise`, `lower`, `drain`,
`set_level`, `inject_fault`, `recover`.

Cenários: `normal`, `attention`, `alert`, `critical`. `tick` avança 5 s e
persiste leituras simuladas; quando a simulação está pausada, o relógio não
avança. `reset` recria o estado inicial e zera contadores.

## Analytics

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/analytics/summary` | contadores e médias |
| GET | `/api/analytics/timeseries` | séries por sensor |
| GET | `/api/analytics/neighborhoods` | agregados por bairro |
| GET | `/api/analytics/sensors` | estatísticas de leitura |
| GET | `/api/analytics/priorities` | priorização explicável |

Todas as respostas incluem `experimental: true` e uma nota. A priorização usa
pesos documentados (recorrência 0,3; severidade 0,3; recência 0,2;
corroboração 0,2) e **não** é modelo preditivo nem classificação oficial de
risco.

## Códigos de erro

| Código | Uso |
| --- | --- |
| 400 | regra de domínio violada (ex.: sensor inexistente) |
| 401 | credencial de dispositivo ausente/incorreta |
| 404 | recurso não encontrado |
| 409 | conflito (device simulado, alerta já encerrado) |
| 422 | payload inválido |
| 503 | ingestão de hardware desabilitada |

## Limitações desta API

- sem autenticação de usuários e sem autorização por perfil;
- sem versionamento de API ou migrações;
- sem paginação por cursor;
- sem rate limiting;
- sem integração oficial ou dados municipais reais;
- sem garantia de disponibilidade, backup ou observabilidade;
- SQLite local, não um banco de produção.

Para configuração e execução, consulte [backend/README.md](../../backend/README.md).
