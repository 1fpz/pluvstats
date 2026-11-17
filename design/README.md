# Design — PLUVSTATS

Requisitos, personas e jornadas do protótipo acadêmico. O que é evidência
qualitativa, premissa de projeto ou hipótese de design aparece identificado em
cada documento.

- [Requisitos](requirements/requirements.md) — funcionais, não funcionais, regras
  de domínio e rastreabilidade.
- [Personas](personas/personas.md) — hipóteses declaradas, não pessoas reais.
- [Jornadas](journeys/journeys.md) — fluxos de gestão, cidadão, campo e
  validação de hardware.
- [Entrevistas qualitativas](research/entrevistas.md) — três conversas anônimas,
  o que se repetiu e o que mudou no produto.
- [Apresentação de Experience](presentation/README.md) — deck com os sete
  entregáveis da disciplina, PDF e diagrama de caso de uso.

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

## Limites do design

- sem auditoria WCAG;
- sem teste com leitor de tela;
- sem validação das personas com pessoas reais;
- sem teste em dispositivos físicos;
- sem pesquisa de identidade visual com usuários.

O design system implementado está descrito no
[README do frontend](../frontend/README.md) e nos componentes em
`frontend/src/components/ui`.
