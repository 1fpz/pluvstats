# Frontend — PLUVSTATS

React + Vite + JavaScript + Tailwind CSS, com Recharts, Leaflet, React Router e
Lucide React.

## Estrutura

```text
src/
├── app/          composição de rotas e providers
├── components/   design system e blocos de interface
├── layouts/      shells de navegação (gestor e cidadão)
├── pages/        páginas por domínio
├── hooks/        hooks reutilizáveis com responsabilidade real
├── services/     acesso a dados (API, fallback demonstrativo, clima)
├── contexts/     estado transversal (modo, dados, simulação, feedback)
├── domain/       regras puras e testáveis (simulação, alertas, inteligência)
├── data/         sementes demonstrativas identificadas
├── utils/        formatação, CSV, validação e geometria
├── styles/       tokens e estilos globais
└── assets/       marca e recursos estáticos
```

## Princípios

- Componentes não calculam regras de negócio.
- O modo de operação é centralizado em configuração e contexto.
- Dados simulados sempre carregam `source: "simulation"`.
- Nenhuma credencial é exposta no bundle.
- Todo acesso a dados passa por `services/dataSource.js`.

## Desenvolvimento

```bash
cd frontend
npm install
npm run dev
```

Variáveis públicas (copie `frontend/.env.example` para `frontend/.env`):

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_WEATHER_BASE_URL=https://api.open-meteo.com/v1
VITE_OPERATION_MODE=demo
VITE_WEATHER_CACHE_TTL_MINUTES=15
```

Sem `VITE_API_BASE_URL`, o frontend opera apenas com o repositório demonstrativo
local. Com a variável definida, ele consulta a API na inicialização; se a API
estiver ausente ou indisponível, volta ao modo local e informa o motivo em
**Diagnóstico**.

## Rotas

| Rota | Área |
| --- | --- |
| `/` | visão geral |
| `/mapa` | mapa territorial |
| `/ocorrencias` | CRUD de ocorrências |
| `/sensores` | sensores e séries |
| `/alertas` | central de alertas |
| `/intervencoes` | intervenções |
| `/relatorios` | indicadores |
| `/diagnostico` | origem dos dados e hardware |
| `/configuracoes` | modo, simulador e limites |
| `/cidadao` | início do cidadão |
| `/cidadao/mapa` | mapa de atenção |
| `/cidadao/registrar` | registro simplificado |
| `/cidadao/informacoes` | segurança e limitações |

## Scripts

```bash
npm run dev      # servidor local
npm run build    # build de produção
npm run lint     # ESLint
npm run test     # Vitest
```

O build atual gera um chunk de aproximadamente 1.179 kB e mantém o aviso de
tamanho. Code splitting não foi implementado nesta entrega.

## Testes

20 testes em Vitest:

- motores de simulação, alertas e inteligência;
- contrato do repositório HTTP, incluindo mapeamento de erros.

Consulte [documentation/testing](../documentation/testing/README.md).
