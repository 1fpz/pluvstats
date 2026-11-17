# Apresentação de Experience — PLUVSTATS

Deck da disciplina **Software & Total Experience Design** para a Global Solution
2026.2 (CitizenTech). O material cobre os sete entregáveis pedidos no enunciado e
mantém a mesma postura do restante do repositório: nada de entrevista, métrica de
mercado ou validação física inventada.

## Arquivos

| Arquivo | Uso |
| --- | --- |
| [`apresentacao.html`](apresentacao.html) | deck editável, 18 slides em 1280 × 720 px |
| [`apresentacao.pdf`](apresentacao.pdf) | versão para entrega e impressão (18 páginas) |
| [`caso-de-uso.svg`](caso-de-uso.svg) | diagrama completo de casos de uso |
| [`caso-de-uso-deck.svg`](caso-de-uso-deck.svg) | versão resumida usada no slide 8 |
| [`assets/`](assets/) | capturas reais do protótipo em demonstração |

As capturas foram feitas do frontend em execução local, com dados demonstrativos.
Não há mockup desenhado à mão: o que aparece no deck existe no código.

## Os sete entregáveis

| # | Entregável | Slides | O que está lá |
| --- | --- | --- | --- |
| 1 | Capa | 1 | nome do produto, disciplina, equipe com RM e aviso de protótipo |
| 2 | Problema | 2–4 | problema, pessoas afetadas, hipóteses e evidências declaradas |
| 3 | Escopo | 5 | dentro e fora do escopo, limites de responsabilidade, dados e técnica |
| 4 | Requisitos, RNF e RN | 6–7 | RF-01 a RF-09, RNF-01 a RNF-08 e RN-01 a RN-08 |
| 5 | Caso de uso | 8–9 | diagrama, atores, objetivos, relações e fronteira do sistema |
| 6 | Protótipo, heurísticas e tom de voz | 10–14 | telas de gestão e cidadão, 10 heurísticas e guia de linguagem |
| 7 | Roadmap | 15–18 | próximos passos, riscos, evidências, limites e encerramento |

## Decisões editoriais

- **Problema como hipótese.** O deck diz explicitamente que não houve entrevista,
  pesquisa de campo ou observação sistemática.
- **Proveniência acima do número.** Todo dado simulado aparece identificado; o
  hardware é sempre descrito como não validado.
- **Duas densidades, um compromisso.** A gestão usa painel denso; o cidadão usa
  linguagem simples e piso tipográfico maior (14–15 px no texto-base).
- **Heurísticas com evidência.** Cada princípio aponta um elemento real da
  interface, não uma intenção genérica.
- **Roadmap sem data inventada.** As etapas avançam por resultado, não por
  calendário fictício.

## Equipe

| Integrante | RM | Participação |
| --- | --- | --- |
| Felipe Ilek | 571322 | Autoria e desenvolvimento do projeto |
| Marcos Vinícius Tudisco | 569366 | Integração e Edge Computing & Computer Systems |
| Michel Tatsuya Hanada | 571987 | Testes e Storytelling & Inspiração Empreendedora |

## Relação com o restante do projeto

- Requisitos e rastreabilidade: [`design/requirements/requirements.md`](../requirements/requirements.md)
- Personas e jornadas: [`design/personas/personas.md`](../personas/personas.md) e
  [`design/journeys/journeys.md`](../journeys/journeys.md)
- Interface implementada: [`frontend/README.md`](../../frontend/README.md)
- Evidências de teste: [`documentation/testing/README.md`](../../documentation/testing/README.md)
