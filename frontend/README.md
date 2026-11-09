# Frontend — PLUVSTATS

React + Vite + JavaScript + Tailwind CSS.

## Estrutura

```text
src/
├── app/          composição de rotas e providers
├── components/   design system e blocos de interface
├── layouts/      shells de navegação (gestor e cidadão)
├── pages/        páginas por domínio
├── hooks/        hooks reutilizáveis com responsabilidade real
├── services/     acesso a dados (API, fallback demonstrativo, clima)
├── contexts/     estado transversal (modo de operação, dados, simulação, feedback)
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

## Scripts

```bash
npm run dev      # servidor local
npm run build    # build de produção
npm run test     # testes unitários (Vitest)
```

Consulte o README raiz para visão geral e o estado das fases.
