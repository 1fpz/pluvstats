# PLUVSTATS

**Inteligência territorial para águas urbanas** · _Dados que antecipam decisões._

Protótipo acadêmico e experimental de monitoramento de pontos de alagamento, com arquitetura modular
(frontend, backend, edge, matemática, design e documentação). O projeto não possui integração oficial
com a Prefeitura de Santo André e não substitui órgãos públicos.

> **Prazo da GS:** 19/11/2026, às 23h55. Checklist por disciplina em
> [`deliverables/checklist.md`](deliverables/checklist.md).

## Ficha da CitizenTech

| Campo | Resposta |
| --- | --- |
| **Nome da CitizenTech** | PLUVSTATS |
| **Cidade e bairro** | Santo André/SP — pontos demonstrativos em Vila Metalúrgica, Jardim, Centro, Jardim Bela Vista e Jardim Bom Pastor |
| **Cidadão beneficiado** | Moradores expostos a alagamentos — pedestres, motoristas, idosos e pessoas com mobilidade reduzida —, gestores municipais e equipes de campo |
| **Problema, em uma frase** | A informação sobre alagamentos é fragmentada, sem origem clara e difícil de transformar em decisão para o gestor e para o cidadão. |
| **Como funciona** | Sensores medem a distância até a água; o sistema converte em nível, taxa de elevação e tempo até o limite, exibe mapa, alertas, ocorrências e intervenções, e oferece uma área do cidadão. Dados simulados são identificados e há fallback local sem API. |
| **Link do repositório** | <https://github.com/1fpz/pluvstats> |
| **Indicador de impacto** | Tempo entre registro e triagem; percentual de pontos com origem e idade visíveis; ocorrências com intervenção concluída. Linha de base a medir no piloto — nenhum impacto real foi medido. |
| **ODS conectados** | ODS 6, ODS 11 e ODS 13 (detalhados abaixo) |

### O que cada parte faz

| Disciplina | Parte da solução | Onde está |
| --- | --- | --- |
| Computational Thinking with Python | aplicação de console com menu, validação e persistência JSON para operar os pontos monitorados | `python-app/` |
| Differentiated Problem Solving | modelo de nível, derivadas, integrais, limites e relatório técnico | `mathematics/` |
| Edge Computing & Computer Systems | ESP32 + HC-SR04 + LEDs + buzzer, com decisão local e Wokwi | `edge/` |
| Front-end Design | interface React/Vite/Tailwind para gestão e cidadão | `frontend/` |
| Software & Total Experience Design | problema, escopo, requisitos, caso de uso, heurísticas, tom de voz e roadmap | `design/` |
| Storytelling & Inspiração Empreendedora | arquétipo de marca, pitch de 3 minutos e e-mail ao investidor | `pitch/` |
| Web Development | interação, hooks, CRUD e integração com a API no mesmo front-end | `frontend/src/hooks`, `frontend/src/services`, `backend/` |

## Equipe

| Integrante | RM | Frente de apresentação |
| --- | --- | --- |
| Felipe Ilek | 571322 | Front-end, experiência do cidadão e identidade visual |
| Michel Tatsuya Hanada | 571987 | Backend, API, persistência e integração |
| Marcos Vinícius Tudisco | 569366 | Edge, matemática e validação de dados |

Detalhes da organização e das evidências por frente em [`TEAM.md`](TEAM.md).

## ODS conectados

A contribuição abaixo é **potencial e não medida**: o projeto é um protótipo
acadêmico, sem piloto real nem dados oficiais.

| ODS | Como o PLUVSTATS se conecta | Indicador que ajudaria a medir |
| --- | --- | --- |
| **ODS 6 — Água potável e saneamento** | organiza sinais de nível e drenagem em um ponto monitorado e dá visibilidade a ocorrências de alagamento | pontos com leitura válida e ocorrências de drenagem triadas |
| **ODS 11 — Cidades e comunidades sustentáveis** | aproxima gestão e cidadão com mapa, alertas e registro de problemas urbanos | tempo entre registro e triagem; ocorrências com intervenção concluída |
| **ODS 13 — Ação contra a mudança global do clima** | apoia a preparação local para chuvas intensas, com limites e incerteza explícitos | pontos monitorados com origem e idade da leitura visíveis |

A conexão é intencionalmente conservadora: o sistema **não** prevê enchentes,
não substitui a Defesa Civil e não aciona equipes. Os ODS orientam o problema e
os indicadores, não uma promessa de impacto.

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
| Módulo de matemática | Concluído (35 testes + relatório técnico) |
| Aplicação Python (menu e JSON) | Concluída (12 testes automatizados) |
| Apresentação de Experience | Concluída (7 entregáveis) |
| Pitch e branding | Concluído (roteiro, arquétipo, e-mail e deck) |
| Documentação | Concluída |

Evidências automatizadas: **23 testes de frontend, 31 de backend, 35 de matemática, 12 da
aplicação Python e 4 de sincronização de limiares**. Detalhes e o que não foi testado em
[documentation/testing](documentation/testing/README.md).

### Documentação principal

- [Arquitetura](documentation/architecture/overview.md)
- [Contrato da API](documentation/api/README.md)
- [Testes e evidências](documentation/testing/README.md)
- [Requisitos, personas e jornadas](design/README.md)
- [Apresentação da disciplina de Experience](design/presentation/README.md)
- [Pitch e slides](pitch/README.md)
- [Aplicação Python (menu e JSON)](python-app/readme.md)
- [Relatório técnico de matemática](mathematics/report/relatorio-tecnico.pdf)
- [Checklist de entrega por disciplina](deliverables/README.md)
- [Checklist de Edge e links do Wokwi/YouTube](edge/ENTREGA.md)
- [Equipe e organização](TEAM.md)
- [Uso de IA](AI.md)

## Testar agora (somente demonstração)

Pré-requisito: **Node.js 20+**. Não é necessário backend, banco, conta ou
credencial. A demonstração roda inteira no navegador, com dados fictícios
identificados em todas as telas.

```bash
git clone https://github.com/1fpz/pluvstats.git
cd pluvstats/frontend
npm install
npm run dev
```

Abra `http://127.0.0.1:5173`.

Roteiro sugerido (5 minutos):

1. **Visão geral** — contadores, mapa, série do sensor e meteorologia externa.
2. **Mapa** — filtre camadas e selecione um ponto.
3. **Sensores** — compare os 4 simulados com o hardware `PS-05` **não validado**.
4. **Configurações** — escolha o cenário **Crítico** e aguarde um ciclo de 5 s.
5. **Alertas** — abra um alerta, leia as métricas e use **Reconhecer**.
6. **Área do cidadão** (`/cidadao`) — registre uma ocorrência e veja o protocolo
   demonstrativo.
7. **Configurações → Reiniciar dados** — volta ao estado inicial.

O roteiro completo de apresentação está em [pitch/README.md](pitch/README.md).

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

Em Linux/macOS, os comandos equivalentes são `python3 -m venv .venv`,
`source .venv/bin/activate`, `pip install -r requirements.txt`,
`cp .env.example .env` e `uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000`.
O backend é opcional para testar a demonstração.

### Integração frontend + backend

Crie `frontend/.env` a partir de `frontend/.env.example` e defina:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

O frontend consulta a API ao iniciar. Se a API estiver ausente ou indisponível, ele retorna ao
runtime demonstrativo local e informa o fallback em **Diagnóstico**. Nenhuma credencial é enviada
ao navegador.

### Subir tudo com um comando

No Windows, o script abaixo cria a venv do backend se necessário, instala as
dependências, sobe a API e o frontend em duas janelas:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-full.ps1
```

Para abrir apenas a demonstração local, sem backend:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-demo.ps1
```

## Deploy

O frontend foi preparado para a Vercel com `frontend/vercel.json` (build Vite e
rewrites de SPA). O passo a passo completo está em
[documentation/deploy.md](documentation/deploy.md).

Resumo:

1. Importe o repositório na Vercel e defina **Root Directory** = `frontend`.
2. Build Command = `npm run build`; Output Directory = `dist`.
3. Variável opcional `VITE_API_BASE_URL` apontando para o backend publicado.
4. Sem backend, a demonstração local continua funcionando; o **Diagnóstico**
   mostra que a API não está configurada.

> O link público do deploy será adicionado aqui após a publicação. Enquanto isso,
> a entrega acadêmica usa o repositório e as instruções locais.

## Testes

```bash
cd frontend && npm run test && npm run lint && npm run build
cd backend && .\.venv\Scripts\python.exe -m pytest
cd .. && python -m unittest discover -s mathematics/tests -p "test_*.py"
python -m unittest discover -s python-app/tests -p "test_*.py"
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
