# ADR-001 — Monorepo modular com contratos explícitos

- **Status:** aceito
- **Data:** 2026-11-09

## Contexto

O projeto precisa entregar frontend, backend, edge, matemática, design e documentação sem
transformar a aplicação em um único bloco. A primeira entrega prioriza estrutura, design system,
navegação, dashboard e mapa.

## Decisão

1. Adotar monorepo com diretórios de responsabilidade única.
2. Manter uma configuração operacional compartilhada em `shared/pluvstats.config.json`
   (limiares, território, geometria do sensor e cenários).
3. O frontend consome dados exclusivamente por uma camada de serviços. Em demonstração, um
   runtime local puro (`src/domain`) permite operar sem backend; com API disponível, o mesmo
   contrato é cumprido pelo FastAPI.
4. O simulador e o motor de alertas são módulos sem dependência de React. A versão canônica de
   persistência é o backend; a versão local existe para demonstração offline e é identificada.
5. Nenhum dado simulado pode ser apresentado como hardware real.

## Consequências

- Há dois adaptadores de dados (API e demonstração) atrás da mesma interface.
- Regras de limiar são compartilhadas por configuração; lógica de avaliação é testada nos dois
  runtimes e documentada como paridade necessária.
- O frontend continua apresentável mesmo se o backend estiver indisponível.
