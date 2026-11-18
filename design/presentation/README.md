# Apresentação de Experience — PLUVSTATS

Deck da disciplina **Software & Total Experience Design** para a Global Solution
2026.2 (CitizenTech). O material cobre os sete entregáveis pedidos no enunciado e
mantém a postura do restante do repositório: nenhuma métrica de mercado, medição
física ou generalização a partir da amostra qualitativa.

## Arquivos

| Arquivo | Uso |
| --- | --- |
| [`apresentacao.html`](apresentacao.html) | deck editável, 19 slides em 1280 × 720 px |
| [`apresentacao.pdf`](apresentacao.pdf) | versão para entrega e impressão (19 páginas) |
| [`caso-de-uso.svg`](caso-de-uso.svg) | diagrama completo de casos de uso |
| [`caso-de-uso-deck.svg`](caso-de-uso-deck.svg) | versão resumida usada no slide 8 |
| [`assets/`](assets/) | capturas reais do protótipo em demonstração |

As capturas foram feitas do frontend em execução local, com dados demonstrativos.
Não há mockup desenhado à mão: o que aparece no deck existe no código.

## Os sete entregáveis

| # | Entregável | Slides | O que está lá |
| --- | --- | --- | --- |
| 1 | Capa | 1 | nome do produto, disciplina, equipe com RM e aviso de protótipo |
| 2 | Problema | 2–5 | problema, pessoas afetadas, entrevistas qualitativas e evidências declaradas |
| 3 | Escopo | 6 | dentro e fora do escopo, limites de responsabilidade, dados e técnica |
| 4 | Requisitos, RNF e RN | 7–8 | RF-01 a RF-09, RNF-01 a RNF-08 e RN-01 a RN-08 |
| 5 | Caso de uso | 9–10 | diagrama, atores, objetivos, relações e fronteira do sistema |
| 6 | Protótipo, heurísticas e tom de voz | 11–15 | telas de gestão e cidadão, 10 heurísticas e guia de linguagem |
| 7 | Roadmap | 16–19 | próximos passos, riscos, evidências, limites e encerramento |

## Decisões editoriais

- **Problema com evidência declarada.** O slide “O que ouvimos” resume três
  conversas qualitativas e anônimas com morador, analista municipal e motorista de
  aplicativo. O deck deixa explícito que a amostra é pequena e não representativa.
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
- Entrevistas qualitativas: [`design/research/entrevistas.md`](../research/entrevistas.md)
- Evidências de teste: [se??o Testes do README](../../README.md#testes)
