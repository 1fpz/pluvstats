# Testes e evidências — PLUVSTATS

Evidências coletadas em **2026-11-11** neste ambiente de desenvolvimento. Nenhum
teste físico, de carga, de segurança ofensiva ou com usuários reais foi realizado.

## Resumo

| Suíte | Comando | Resultado |
| --- | --- | --- |
| Frontend (domínio + API) | `cd frontend && npm run test` | **23 aprovados** |
| Frontend lint | `cd frontend && npm run lint` | **sem erros** |
| Frontend build | `cd frontend && npm run build` | **sucesso**, bundle de 1.179,30 kB (326,88 kB gzip) |
| Backend | `cd backend && .\.venv\Scripts\python.exe -m pytest` | **31 aprovados** em 16,70 s |
| Matemática | `python -m unittest discover -s mathematics/tests -p "test_*.py"` | **25 aprovados** |
| Sincronização de limiares | `python -m unittest discover -s edge/tools -p "test_*.py"` | **4 aprovados** |
| Firmware físico | — | **não executado** |
| Wokwi | — | **não executado** |

## Frontend

Arquivos de teste:

- `frontend/src/domain/__tests__/alertEngine.test.js` — 5 testes;
- `frontend/src/domain/__tests__/simulationEngine.test.js` — 5 testes;
- `frontend/src/domain/__tests__/intelligence.test.js` — 4 testes;
- `frontend/src/services/__tests__/apiRepository.test.js` — 6 testes;
- `frontend/src/utils/__tests__/severity.test.js` — 3 testes.

Cobertura comportamental:

- criação, escalonamento, reconhecimento e resolução de alertas;
- histerese de nível e taxa;
- ticks determinísticos do simulador e comandos;
- priorização explicável;
- severidade pública calculada apenas a partir de sinais atuais (sensores e
  alertas abertos), sem promover ocorrências históricas;
- contrato do repositório HTTP: URL com/sem `/api`, snapshot, tick,
  mapeamento de `422` em erros de campo, envio de ocorrência e validação local
  antes da chamada.

Resultado do Vitest:

```text
Test Files  5 passed (5)
Tests       23 passed (23)
```

`npm run lint` termina sem saída. `npm run build` termina com sucesso e mantém o
aviso de chunk acima de 500 kB; não há code splitting nesta entrega.

## Backend

A suíte usa um banco SQLite temporário por aplicação de teste. O banco padrão não
é tocado. Os testes cobrem:

- health, configuração pública e ausência de segredos na resposta;
- snapshot, proveniência e hardware não validado;
- CRUD, validação e filtros de ocorrências;
- criação, atualização e regra de conclusão de intervenções;
- tick, cenários, comandos, pausa, reset e histerese;
- reconhecimento e resolução de alertas;
- hardware desabilitado, chave inválida, dispositivo desconhecido, device
  simulado, leitura inválida e leitura antiga;
- analytics, prioridades e reset da demonstração.

Resultado:

```text
31 passed, 1 warning in 16.70s
```

Aviso não bloqueante:

```text
StarletteDeprecationWarning: Using `httpx` with `starlette.testclient` is deprecated
```

## Matemática

25 testes cobrem as fórmulas e os cenários:

- `h = H - d`, saturação e rejeição de distância negativa/NaN;
- taxa em cm/min, drenagem e `Δt` inválido;
- tempo até o limite, `v ≤ 0` e limite já atingido;
- projeção linear e saturação;
- tendência por mínimos quadrados;
- cenários e consistência com o JSON compartilhado.

## Edge

Os quatro testes verificam que `generated_config.h` corresponde exatamente ao
JSON compartilhado, que os valores críticos são renderizados e que o formato
numérico é válido em C.

**Não há teste de compilação do firmware** neste ambiente: o Arduino CLI e o
core ESP32 não estão instalados. O `diagram.json` do Wokwi é válido como JSON,
mas não foi executado. Isso está registrado no [README do edge](../../edge/README.md).

## Integração frontend + API

Verificação manual em navegador, com backend em `127.0.0.1:8000` e frontend em
`127.0.0.1:5174` (`VITE_API_BASE_URL=http://127.0.0.1:8000`):

1. **Diagnóstico** exibiu “API acessível”, origem `api`, base configurada e
   demonstração ativa.
2. O registro simplificado do cidadão criou `OCO-2026-0149` no SQLite.
3. O reset pela interface restaurou **9 ocorrências, 0 alertas, cenário Normal**
   e simulação em execução.
4. Nenhum erro de console foi observado nesse fluxo.

### Modo somente demonstração

Servidor em `127.0.0.1:5173`, sem `VITE_API_BASE_URL`:

- Diagnóstico exibiu “Tipo de fonte: demo”;
- “API de operação: Ausente” e “VITE_API_BASE_URL não definida”;
- a simulação permaneceu funcional com dados locais.

### API configurada, mas indisponível

Servidor em `127.0.0.1:5176`, com `VITE_API_BASE_URL=http://127.0.0.1:8999`
(sem serviço):

- o frontend caiu para “Demonstração local (fallback)”;
- Diagnóstico mostrou a base configurada e a API ausente;
- os erros de rede no console eram esperados (`ERR_FAILED`/CORS) e não
  impediram a interface de operar.

Esse teste comprova **degradação**, não conectividade real.

## Verificações manuais realizadas

- navegação entre as rotas de gestão e do cidadão;
- mapa com Leaflet e deep link `?selected=`;
- criação de ocorrência pelo cidadão e aparecimento na gestão;
- comandos de simulação, pausa, cenário e reset;
- atualização de sensores e diferenciação visual entre simulado e hardware;
- ausência de erros de lint e de build.

## O que não foi testado

- montagem física, calibração ou instalação do ESP32;
- comunicação real do ESP32 com a API;
- execução do diagrama no Wokwi;
- acessibilidade com leitores de tela ou usuários;
- navegadores diferentes do Chromium usado na verificação;
- responsividade em dispositivos físicos;
- carga, concorrência, rate limiting e recuperação de falhas;
- autenticação/autorização;
- deploy, HTTPS, backup e observabilidade;
- integração com Supabase (não configurada);
- precisão hidrológica ou utilidade operacional do modelo.

## Lacunas de evidência acadêmica

Não há entrevistas, questionários, dados oficiais importados, fotos de campo ou
validação por especialistas. Essas atividades devem ser conduzidas e registradas
antes de qualquer afirmação de impacto real. Ver
[design/research](../../design/research/research-plan.md).

## Como reproduzir

```bash
# frontend
cd frontend
npm install
npm run test
npm run lint
npm run build

# backend
cd ../backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pytest

# matemática e edge
cd ..
python -m unittest discover -s mathematics/tests -p "test_*.py"
python -m unittest discover -s edge/tools -p "test_*.py"
python edge/tools/sync_thresholds.py --check
```

## Critérios para uma próxima fase

1. Compilar o firmware com o core ESP32 e registrar a versão usada.
2. Executar o Wokwi e anexar telemetria/captura ao relatório.
3. Testar o upload em rede local com um banco descartável.
4. Medir erro do sensor em bancada com distâncias conhecidas.
5. Fazer teste de acessibilidade e usabilidade com pelo menos um usuário de
   cada perfil, registrando consentimento e método.
6. Só então discutir integração institucional.
