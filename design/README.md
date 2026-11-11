# Design — PLUVSTATS

Pesquisa, requisitos, personas e jornadas **do projeto acadêmico**. Nenhuma
entrevista ou pesquisa de campo é inventada; quando não há evidência, o documento
registra a lacuna e o roteiro de coleta.

- [Requisitos](requirements/requirements.md) — funcionais, não funcionais, regras
  de domínio e rastreabilidade.
- [Personas](personas/personas.md) — hipóteses declaradas, não pessoas reais.
- [Jornadas](journeys/journeys.md) — fluxos de gestão, cidadão, campo e
  validação de hardware.
- [Plano de pesquisa](research/research-plan.md) — perguntas, métodos, ética e o
  que ainda não foi feito.

## Identidade

- Produto: **PLUVSTATS**.
- Assinatura: *Inteligência territorial para águas urbanas*.
- Slogan: *Dados que antecipam decisões*.
- Território demonstrativo: Santo André/SP.
- Tom: técnico, sóbrio, explícito sobre incerteza.

## Princípios de interface

1. Proveniência visível em cada camada.
2. Nenhuma promessa de emergência.
3. Densidade para gestão, simplicidade para o cidadão.
4. Estados vazios, de erro e de carregamento explícitos.
5. Mobile-first na área do cidadão.
6. Contraste e foco visíveis; sem depender apenas de cor.

## Lacunas de design

- sem auditoria WCAG;
- sem teste com leitor de tela;
- sem validação das personas;
- sem teste em dispositivos físicos;
- sem pesquisa de identidade visual com usuários.

O design system implementado está descrito no [README do frontend](../frontend/README.md)
e nos componentes em `frontend/src/components/ui`.
