# Pacote de submissão — PLUVSTATS

Documento operacional para enviar as 7 disciplinas **hoje**. Cada seção tem o
texto pronto para colar, o anexo e o que conferir antes de clicar em enviar.

> **Regra:** nada aqui afirma entrevista, impacto, parceria ou validação que não
> exista. Se uma frase não for verdadeira para a sua entrega, apague a frase.

## Links para colar

Preencha uma vez e use nos textos abaixo.

| Item | Valor |
| --- | --- |
| URL da Vercel | `<<COLAR URL DA VERCEL>>` |
| Projeto no Wokwi (público) | `<<COLAR LINK DO WOKWI>>` |
| Vídeo de Edge no YouTube | `<<COLAR LINK DO VÍDEO DE EDGE>>` |
| Vídeo de Pitch no YouTube | `<<COLAR LINK DO VÍDEO DE PITCH>>` |
| Backend público (se existir) | `<<COLAR URL DA API ou ESCREVER "não publicado">>` |

## O que dá para enviar agora

| Disciplina | Estado | O que falta antes de enviar |
| --- | --- | --- |
| **Matemática** | **pronto** | conferir 8 páginas e os nomes/RMs |
| **Python** | 2 minutos | rodar `deliverables/build_zips.ps1` e pegar o ZIP |
| **Experience** | 5 minutos | atualizar o slide 17, regerar o PDF; entrevista é opcional |
| **Front-end** | 5 minutos | colar a URL no README, gerar o ZIP do projeto |
| **Web** | 5 minutos | mesmo deploy e ZIP do Front-end |
| **Edge** | bloqueado | gravar o vídeo, publicar e colar os 2 links |
| **Pitch** | bloqueado | gravar o vídeo, publicar e gerar o PDF do e-mail com o link |

**A única 100% pronta neste instante é Matemática.** Python e Experience ficam
prontas em poucos minutos; Front-end e Web dependem da URL e do ZIP; Edge e Pitch
dependem dos vídeos.

---

## Dados fixos da equipe

Use este bloco em todas as submissões:

```text
Global Solution 2026.2 — CitizenTech
Projeto: PLUVSTATS — inteligência territorial para águas urbanas
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)
```

---

## 1. Computational Thinking with Python

**Onde:** Teams → Computational Thinking with Python → Tarefa da Global Solution.
**Quem:** um integrante.
**Anexo:** `pluvstats-python.zip`.
**Assunto sugerido:** `GS 2026.2 — PLUVSTATS — Computational Thinking with Python`

**Antes de enviar (2 min):**

```powershell
powershell -ExecutionPolicy Bypass -File deliverables/build_zips.ps1
```

Confira que o ZIP tem `app.py`, `prompt.md`, `readme.md`, `tests/` e `data/`, sem
`__pycache__`, `estado.json` ou `.env`.

**Texto:**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Computational Thinking with Python
Projeto: PLUVSTATS — inteligência territorial para águas urbanas
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Anexo: pluvstats-python.zip
Conteúdo: app.py, prompt.md, readme.md, tests/ e data/.
O projeto é um protótipo acadêmico com dados simulados identificados.
```

---

## 2. Differentiated Problem Solving (Matemática)

**Onde:** Portal do aluno → Differentiated Problem Solving → atividade da Global Solution.
**Quem:** um representante do grupo.
**Anexos:** `mathematics/model/pluvstats_model.py`,
`mathematics/tools/plot_scenarios.py`, `mathematics/report/relatorio-tecnico.pdf`.
**Assunto sugerido:** `GS 2026.2 — PLUVSTATS — Differentiated Problem Solving`

**Antes de enviar (2 min):**

- abra o PDF e confira **8 páginas** e os nomes/RMs;
- confira se o Portal aceita múltiplos anexos. Se aceitar só um, gere um ZIP
  `pluvstats-matematica.zip` com modelo, gráficos, testes e PDF.

**Texto:**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Differentiated Problem Solving
Projeto: PLUVSTATS
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Anexos: pluvstats_model.py, plot_scenarios.py, relatorio-tecnico.pdf.
O modelo é linear e didático; não é um modelo hidrológico calibrado.
```

---

## 3. Edge Computing & Computer Systems

**Onde:** Teams → Edge Computing & Computer Systems → Tarefa.
**Quem:** **apenas um aluno** da equipe.
**Anexos:** nenhum. A tarefa pede **somente os dois links** e os nomes/RMs.
**Assunto sugerido:** `GS 2026.2 — PLUVSTATS — Edge Computing`

**Antes de enviar:**

- abra o link do Wokwi em janela anônima e confirme que **roda sem ajustes**;
- abra o vídeo em janela anônima e confirme que está público ou não listado;
- confira se o vídeo mostra os cinco estados e cita os limites.

**Texto:**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Edge Computing & Computer Systems
Projeto: PLUVSTATS — nó de borda com ESP32
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Projeto Wokwi (público): <<COLAR LINK DO WOKWI>>
Vídeo no YouTube (não listado): <<COLAR LINK DO VÍDEO DE EDGE>>

O protótipo é acadêmico, não foi validado fisicamente e não é um sistema
oficial de alerta.
```

> Se o Wokwi tiver qualquer ajuste manual para rodar, **não envie ainda**. O
> enunciado pede projeto que abre e roda sozinho.

---

## 4. Front-end Design

**Onde:** Teams → Front-end Design → Tarefa (separada de Web Development).
**Quem:** um integrante.
**Anexos:** `pluvstats-projeto.zip`, `README.md` e `AI.md` (os dois últimos já
estão dentro do ZIP; anexe separado se a tarefa permitir).
**Assunto sugerido:** `GS 2026.2 — PLUVSTATS — Front-end Design`

**Antes de enviar:**

```powershell
powershell -ExecutionPolicy Bypass -File deliverables/build_zips.ps1
```

- cole a URL da Vercel no `README.md`, na seção **Deploy**;
- abra a URL em janela anônima e teste criar, editar e excluir uma ocorrência;
- confirme que o repositório abre sem login (hoje está público).

**Texto:**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Front-end Design
Projeto: PLUVSTATS
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Repositório: https://github.com/1fpz/pluvstats
Deploy: <<COLAR URL DA VERCEL>>

Anexo: pluvstats-projeto.zip (código, README.md e AI.md).
O projeto roda sem backend: o repositório demonstrativo local assume e o
Diagnóstico informa o fallback. Com VITE_API_BASE_URL, o CRUD usa a API FastAPI.
```

> Se o backend também estiver publicado, troque a última frase por:
> “O deploy usa a API publicada em `<<URL DA API>>`; sem ela, o frontend cai no
> repositório demonstrativo local.”

---

## 5. Software & Total Experience Design

**Onde:** Teams → Software & Total Experience Design → Tarefa.
**Quem:** um integrante.
**Anexo:** `design/presentation/apresentacao.pdf`.
**Assunto sugerido:** `GS 2026.2 — PLUVSTATS — Software & Total Experience Design`

**Antes de enviar:**

- o deck ainda diz que Wokwi e Vercel “não foram executados”; atualize o slide
  17 e regenere o PDF (comando abaixo);
- se **não** fizer entrevistas, use a versão A do texto e não mencione conversas;
- se fizer as 3 conversas, siga
  [`slide-o-que-ouvimos.md`](../design/presentation/slide-o-que-ouvimos.md),
  o PDF passa a ter 19 páginas.

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (!(Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
& $edge --headless --disable-gpu --no-first-run `
  --print-to-pdf="design/presentation/apresentacao.pdf" `
  --print-to-pdf-no-header `
  "file:///$((Resolve-Path design/presentation/apresentacao.html).Path -replace '\\','/')"
```

**Texto — versão A (sem entrevistas):**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Software & Total Experience Design
Projeto: PLUVSTATS — da proposta ao roadmap
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Anexo: pluvstats-experience.pdf (18 slides).
Os sete entregáveis da disciplina estão contemplados. As personas e hipóteses
são declaradas como hipóteses de projeto; não houve entrevistas nesta entrega.
```

**Texto — versão B (com 3 conversas reais):**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Software & Total Experience Design
Projeto: PLUVSTATS — da proposta ao roadmap
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Anexo: pluvstats-experience.pdf (19 slides).
O slide “O que ouvimos” registra 3 conversas exploratórias, sem generalização
estatística. As demais personas continuam declaradas como hipóteses.
```

---

## 6. Storytelling & Inspiração Empreendedora (Pitch)

**Onde:** Teams → Storytelling & Inspiração Empreendedora → Tarefa.
**Quem:** um integrante.
**Anexo:** um **único PDF** com o texto do e-mail e o link do vídeo.
**Assunto sugerido:** `GS 2026.2 — PLUVSTATS — Storytelling e Pitch`

**Antes de enviar:**

1. grave o vídeo de até 3 minutos com rosto, voz e o deck;
2. publique no YouTube como **público ou não listado**;
3. substitua o link nos **dois lugares** de `pitch/email-investidor.md`;
4. copie o e-mail para Word/Google Docs, insira o link e exporte em PDF com o
   nome `pluvstats-pitch-email.pdf`;
5. abra o link em janela anônima.

**Texto:**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Storytelling & Inspiração Empreendedora
Projeto: PLUVSTATS
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Anexo: pluvstats-pitch-email.pdf (e-mail ao investidor + link do vídeo).
Vídeo: <<COLAR LINK DO VÍDEO DE PITCH>>
Duração: <<mm:ss>>. Publicado como não listado no YouTube.
```

---

## 7. Web Development

**Onde:** Teams → Web Development → Tarefa. **Separada** de Front-end Design,
para o outro professor.
**Quem:** um integrante.
**Anexos:** os mesmos do Front-end: `pluvstats-projeto.zip`, `README.md` e `AI.md`.
**Assunto sugerido:** `GS 2026.2 — PLUVSTATS — Web Development`

**Texto:**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Web Development
Projeto: PLUVSTATS
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Repositório: https://github.com/1fpz/pluvstats
Deploy: <<COLAR URL DA VERCEL>>

Anexo: pluvstats-projeto.zip (código, README.md e AI.md).
Aplicação React/Vite/Tailwind com componentes reutilizáveis, custom hooks,
separação entre domínio, dados e apresentação, e CRUD de ocorrências. O fallback
local mantém a demonstração mesmo sem API.
```

> Front-end e Web usam o **mesmo app**, mas são **duas submissões** com professores
> diferentes. Não envie uma única submissão para as duas.

---

## Ordem de envio sugerida

1. **Matemática** — já está pronta; envie enquanto as outras ficam prontas.
2. **Python** — rode o script, confira o ZIP, envie.
3. **Experience** — atualize o slide 17, regenere o PDF, envie.
4. **Front-end** — cole a URL, gere o ZIP, teste o CRUD, envie.
5. **Web** — mesma coisa, em outra tarefa.
6. **Edge** — só depois do vídeo e dos dois links.
7. **Pitch** — só depois do vídeo e do PDF do e-mail.

## Checklist final antes de cada envio

- [ ] Nomes e RMs dos três integrantes no corpo da submissão.
- [ ] Anexo abre e não está corrompido.
- [ ] Links abrem em janela anônima, sem login.
- [ ] Nenhum `.env`, banco, `node_modules` ou `.venv` no ZIP.
- [ ] O texto não afirma entrevista, impacto, parceria ou validação inexistente.
- [ ] A disciplina certa foi selecionada no Teams/Portal.
- [ ] Depois de enviar, baixe o anexo enviado e confira que abriu.
