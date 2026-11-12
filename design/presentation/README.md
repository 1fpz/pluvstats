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
| [`rubrica-review.md`](rubrica-review.md) | revisão slide a slide contra os 100 pontos da disciplina |
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
  pesquisa de campo ou observação sistemática. O plano de pesquisa mostra como
  validar.
- **Proveniência acima do número.** Todo dado simulado aparece identificado; o
  hardware é sempre descrito como não validado.
- **Duas densidades, um compromisso.** A gestão usa painel denso; o cidadão usa
  linguagem simples e piso tipográfico maior (14–15 px no texto-base).
- **Heurísticas com evidência.** Cada princípio aponta um elemento real da
  interface, não uma intenção genérica.
- **Roadmap sem data inventada.** As etapas avançam por resultado, não por
  calendário fictício.

## Equipe

| Integrante | RM | Frente de apresentação |
| --- | --- | --- |
| Felipe Ilek | 571322 | Front-end, experiência do cidadão e identidade visual |
| Michel Tatsuya Hanada | 571987 | Backend, API, persistência e integração |
| Marcos Vinícius Tudisco | 569366 | Edge, matemática e validação de dados |

## Como regenerar o PDF

O HTML usa tamanho fixo de slide (`1280 × 720 px`) e a regra `@page` correspondente.
No Windows, com o Microsoft Edge instalado:

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (!(Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
& $edge --headless --disable-gpu --no-first-run `
  --print-to-pdf="design/presentation/apresentacao.pdf" `
  --print-to-pdf-no-header `
  "file:///$((Resolve-Path design/presentation/apresentacao.html).Path -replace '\\','/')"
```

Verificação rápida:

```powershell
python -c "from pypdf import PdfReader; print(len(PdfReader(r'design/presentation/apresentacao.pdf').pages))"
# 18
```

O PDF tem 18 páginas em 960 × 540 pt (16:9). Se o número mudar, algum slide
quebrou e o HTML precisa ser ajustado antes da entrega.

## Como apresentar

1. Abra o PDF em tela cheia (ou o HTML no navegador, com zoom para caber a janela).
2. Reserve 12–15 minutos: 1 min de capa, 4 min de problema e escopo, 4 min de
   requisitos e caso de uso, 4 min de protótipo e heurísticas, 2 min de roadmap.
3. Se houver demonstração ao vivo, use o roteiro de [`pitch/README.md`](../../pitch/README.md)
   e mantenha o frontend já aberto na Visão geral.
4. Encerre no slide 18 com a frase de limite: “um protótipo pequeno, com limites
   grandes e visíveis”.

## O que ainda falta

- gravação em vídeo da apresentação;
- teste do deck com a banca ou com alguém externo à equipe;
- revisão de acessibilidade do PDF (tags, ordem de leitura e texto alternativo);
- versão em PowerPoint/Google Slides, se a disciplina exigir formato editável
  nativo. Hoje o HTML é a fonte editável.

## Relação com o restante do projeto

- Requisitos e rastreabilidade: [`design/requirements/requirements.md`](../requirements/requirements.md)
- Personas e jornadas: [`design/personas/personas.md`](../personas/personas.md) e
  [`design/journeys/journeys.md`](../journeys/journeys.md)
- Plano de pesquisa: [`design/research/research-plan.md`](../research/research-plan.md)
- Interface implementada: [`frontend/README.md`](../../frontend/README.md)
- Evidências de teste: [`documentation/testing/README.md`](../../documentation/testing/README.md)
