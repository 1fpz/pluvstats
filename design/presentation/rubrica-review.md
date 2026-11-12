# Revisão do deck contra a rubrica — Experience

Leitura interna do deck [`apresentacao.pdf`](apresentacao.pdf) contra os critérios
da disciplina **Software & Total Experience Design** (100 pontos). Não é a nota
da banca: é um mapa de onde o material já entrega, onde há risco e o que ajustar
antes de submeter.

> **Data da revisão:** 12/11/2026. Vale para o PDF de 18 páginas gerado a partir
> de [`apresentacao.html`](apresentacao.html).

## Resumo por critério

| Critério | Pontos | Slides | Situação | Risco principal | Faixa estimada |
| --- | --- | --- | --- | --- | --- |
| Capa | 5 | 1 | pronto | nenhum | 5 |
| Descrição do problema | 10 | 2–4 | bom, sem evidência primária | banca cobrar “pessoa real” | 6–8 |
| Escopo da solução | 10 | 5 | pronto | nenhum | 9–10 |
| Requisitos, RNF e RN | 20 | 6–7 | forte | densidade da tabela | 17–20 |
| Caso de uso e contextualização | 15 | 8–9 | forte | legibilidade do diagrama | 12–15 |
| Protótipo, heurísticas e tom | 25 | 10–14 | forte | slide 13 com 10 itens | 20–25 |
| Roadmap | 15 | 15 | forte | excesso de etapas em um slide | 13–15 |
| **Total** | **100** | 18 | — | — | **82–98** |

A faixa é larga de propósito. O limite inferior assume uma banca rígida com a
ausência de pesquisa e com a legibilidade em projeção; o superior assume que a
narrativa e a demo ao vivo funcionam. **A única forma de subir o piso é ouvir
pessoas reais e mostrar o que mudou.**

## Slide a slide

| # | Papel no critério | O que está bom | Risco | Ação |
| --- | --- | --- | --- | --- |
| 1 | Capa | nome, disciplina, três integrantes com RM, aviso de protótipo | identificação do time era implícita | **feito:** “Equipe PLUVSTATS” no cabeçalho |
| 2 | Narrativa | quatro atos e promessa de evidência | pode soar genérico se não houver demo | mantenha curto na fala |
| 3 | Problema | o que acontece, quem é afetado, por que importa, o que não sabemos | “observação informal” não comprovada | **feito:** texto trocado por “briefing e repertório da equipe” |
| 4 | Evidências | separa fato, hipótese e lacuna | “fato público” sem fonte | **feito:** virou “premissa do projeto”; cite fonte se usar dado externo |
| 5 | Escopo | dentro/fora + limites de responsabilidade | nenhum | mantém |
| 6 | RF | 9 requisitos com justificativa ligada ao problema | tabela densa em projeção | leia só 2 exemplos; o resto fica no PDF |
| 7 | RNF/RN | 8 + 8 itens com consequência | texto pequeno | aponte 1 RNF e 1 RN; não leia a tabela |
| 8 | Caso de uso | diagrama completo com fronteira | rótulos pequenos | testar em 1280 × 720 e em projetor |
| 9 | Atores | objetivo, ação e limite por ator | nenhum | mantém |
| 10 | Protótipo gestão | captura real, hierarquia, proveniência e ação | nenhum | use a demo ao vivo se possível |
| 11 | Estado crítico | alerta explica o quê, por quê e o que fazer | nenhum | mostre o reconhecimento |
| 12 | Cidadão | duas telas reais, piso tipográfico, privacidade | nenhum | destaque “sem dados pessoais” |
| 13 | Heurísticas | 10 princípios com evidência e método declarado | 10 cartões em um slide; título dizia “oito” | **feito:** título corrigido para “dez”; considere dividir em 2 slides |
| 14 | Tom de voz | princípios, anti-exemplos e falas reais | nenhum | leia uma frase de cada coluna |
| 15 | Roadmap | 6 etapas com resultado e critério de parada | muita informação | conta a história em 40 s, sem ler tudo |
| 16 | Decisões e riscos | trade-offs e critérios de sucesso | extra; pode faltar tempo | use como respaldo, não como slide principal |
| 17 | Evidências | testes, build, o que falta | números mudam se o código mudar | atualizar após o deploy e os vídeos |
| 18 | Encerramento | frase memorável + time | nenhum | pare de falar no limite |

## Correções já aplicadas nesta revisão

1. Capa passou a identificar **Equipe PLUVSTATS**, além dos nomes e RMs.
2. Slide 3 deixou de afirmar “observação informal do território”, que não era
   comprovada.
3. Slide 4 deixou de chamar a premissa de “fato público” sem fonte.
4. Slide 13 passou de “oito” para **dez princípios**, coerente com o conteúdo.

## Prioridades antes da submissão

### P0 — sem isso, o problema fica frágil

- Fazer as três conversas do [`interview-kit.md`](../research/interview-kit.md).
- Criar um slide **“O que ouvimos”** com três falas anônimas e duas decisões que
  mudaram por causa delas. Pode entrar depois do slide 4 ou substituir parte do
  slide 16.
- Dizer em voz alta: “conversamos com N pessoas; isso não é uma pesquisa
  estatística”.

### P1 — legibilidade e tempo

- Testar os slides 6, 7, 8, 13 e 15 em uma tela de 1280 × 720 e, se possível, em
  projetor. Se o texto não for legível a 2 metros, divida o slide 13 em dois.
- Ensaiar a apresentação em **12–15 minutos**, com 1 min de capa, 4 de problema e
  escopo, 4 de requisitos e caso de uso, 4 de protótipo e heurísticas, 2 de
  roadmap.
- Não ler tabelas. Escolher dois exemplos e explicar o critério.

### P2 — polimento

- Atualizar o slide 17 depois do deploy e dos vídeos; hoje ele lista o que ainda
  não foi executado, o que é correto, mas envelhece rápido.
- Se a banca pedir PowerPoint, exportar o HTML; a fonte editável é o HTML.
- Revisar o PDF com leitor de tela é uma lacuna declarada, não um item resolvido.

## Revisão curta do deck de Pitch (10 pontos)

| Critério | Pontos | Onde está | Situação |
| --- | --- | --- | --- |
| Cidadão beneficiado e clareza do problema | 2,0 | slides 2–3 + narração | bom, sem evidência primária |
| Solução e proposta de valor | 2,0 | slides 4, 8 | forte |
| Tecnologias e coerência | 1,5 | slide 5 | forte |
| Storytelling e qualidade do vídeo | 2,0 | roteiro + deck | **depende do vídeo não gravado** |
| Branding, e-mail, arquétipo, MVV | 2,5 | slide 8 + `pitch/branding.md` e `email-investidor.md` | forte |

**Leitura interna:** 8,0/10 hoje, porque o vídeo vale 2,0 e ainda não existe.
Com um vídeo de 3 minutos bem gravado, o deck tem material para 9,5–10,0. O risco
não é conteúdo; é execução.

## O que esta revisão não garante

- não substitui a leitura dos professores;
- não mede se a banca valoriza honestidade acima de impacto;
- não corrige a ausência de uma pessoa real — só a conversa corrige;
- não impede que a projeção da sala estrague a legibilidade.
