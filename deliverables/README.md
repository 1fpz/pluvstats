# Entregáveis — PLUVSTATS

Mapa de entrega da Global Solution 2026.2 (CitizenTech). Cada disciplina tem um
artefato próprio, mas todos partem do mesmo repositório. O que depende de ação
humana está marcado como **pendente** — não há link, vídeo ou deploy inventado.

> O plano completo, com o que falta, playbooks de execução, cronograma de
> 13–19/11, riscos, Q&A e critérios de vitória, está em
> [`../PLANO-DE-ENTREGA.md`](../PLANO-DE-ENTREGA.md).

## Resumo por disciplina

| # | Disciplina | Artefato principal | Estado |
| --- | --- | --- | --- |
| 1 | Computational Thinking with Python | `python-app/` + ZIP | pronto para empacotar |
| 2 | Differentiated Problem Solving | `.py` + relatório PDF | pronto |
| 3 | Edge Computing & Computer Systems | firmware + Wokwi + vídeo | firmware pronto; links **pendentes** |
| 4 | Front-end Design | app React + repositório + ZIP + README + deploy + `AI.md` | app pronto; deploy **pendente** |
| 5 | Software & Total Experience Design | deck com 7 entregáveis | pronto |
| 6 | Storytelling & Inspiração Empreendedora | e-mail + arquétipo/MVV + vídeo 3 min | documentos prontos; vídeo **pendente** |
| 7 | Web Development | mesma aplicação + `AI.md` + ZIP + deploy | pronto; deploy **pendente** |

## 1. Python — ZIP

O ZIP deve conter, na raiz:

```text
app.py
prompt.md
readme.md
tests/
data/
```

Gerado por `deliverables/build_zips.ps1` como `deliverables/zips/pluvstats-python.zip`.
A aplicação usa apenas a biblioteca padrão e funciona isolada, sem o restante do
monorepo.

- Código: [`python-app/app.py`](../python-app/app.py)
- Uso de IA: [`python-app/prompt.md`](../python-app/prompt.md)
- Descrição: [`python-app/readme.md`](../python-app/readme.md)
- Testes: 12 aprovados.

## 2. Matemática — `.py` + PDF

- Código: [`mathematics/model/pluvstats_model.py`](../mathematics/model/pluvstats_model.py)
- Cenários: [`mathematics/scenarios/`](../mathematics/scenarios/)
- Gráficos: [`mathematics/graphs/`](../mathematics/graphs/)
- Relatório: [`mathematics/report/relatorio-tecnico.pdf`](../mathematics/report/relatorio-tecnico.pdf)
- Testes: 35 aprovados.

O PDF tem 8 páginas e é gerado por `mathematics/report/build_report.py` a partir
do mesmo modelo usado nos testes. Nada foi calibrado com dados de campo.

## 3. Edge — links do Wokwi e do YouTube

- Firmware: [`edge/esp32/pluvstats_sensor/pluvstats_sensor.ino`](../edge/esp32/pluvstats_sensor/pluvstats_sensor.ino)
- Wokwi: [`edge/wokwi/`](../edge/wokwi/)
- Checklist e roteiro: [`edge/ENTREGA.md`](../edge/ENTREGA.md)

**Pendente:** publicar o projeto no Wokwi, gravar o vídeo de até 7 minutos e
preencher os dois links em `edge/ENTREGA.md`. A simulação não foi executada
neste ambiente.

## 4 e 7. Front-end / Web — repositório, ZIP, README, deploy e AI.md

- Aplicação: [`frontend/`](../frontend/)
- API: [`backend/`](../backend/)
- README: [`README.md`](../README.md) e [`frontend/README.md`](../frontend/README.md)
- IA: [`AI.md`](../AI.md)
- Configuração de deploy: [`frontend/vercel.json`](../frontend/vercel.json)
- Passo a passo: [`documentation/deploy.md`](../documentation/deploy.md)

**Pendente:** publicar na Vercel (ou outro serviço), copiar a URL para o README e
confirmar que os professores conseguem abrir o repositório — hoje ele está
**público**. O enunciado pede repositório privado com acesso de escrita; se a
disciplina exigir, torne-o privado e adicione os professores como colaboradores.

O repositório já tem mais de 15 commits e inclui a mesma aplicação usada nas duas
disciplinas. O ZIP do projeto é gerado como `deliverables/zips/pluvstats-projeto.zip`.

## 5. Experience — deck

- Deck: [`design/presentation/apresentacao.pdf`](../design/presentation/apresentacao.pdf)
- Fonte editável: [`design/presentation/apresentacao.html`](../design/presentation/apresentacao.html)
- Guia: [`design/presentation/README.md`](../design/presentation/README.md)

18 slides cobrindo os sete entregáveis do enunciado. Nomes e RMs aparecem na
capa e no encerramento.

## 6. Pitch — e-mail, arquétipo, MVV e vídeo

- Branding/MVV: [`pitch/branding.md`](../pitch/branding.md)
- E-mail ao investidor: [`pitch/email-investidor.md`](../pitch/email-investidor.md)
- Roteiro do vídeo: [`pitch/roteiro-video.md`](../pitch/roteiro-video.md)
- Deck: [`pitch/apresentacao-pitch.pdf`](../pitch/apresentacao-pitch.pdf)

**Pendente:** gravar o vídeo de até 3 minutos, publicar no YouTube como público
ou não listado e substituir o marcador de link no e-mail.

## Como gerar os ZIPs

No Windows, na raiz do repositório:

```powershell
powershell -ExecutionPolicy Bypass -File deliverables/build_zips.ps1
```

Saída em `deliverables/zips/`:

- `pluvstats-python.zip` — apenas a aplicação Python, com `app.py`, `prompt.md`,
  `readme.md`, testes e dados de exemplo;
- `pluvstats-projeto.zip` — projeto completo, sem `node_modules`, `.venv`,
  caches, builds, banco local, `.git` ou os próprios ZIPs.

Os arquivos gerados não são versionados. O script pode ser executado novamente
antes de cada submissão.

## Checklist rápido

- [ ] Rodar os testes de todas as suítes.
- [ ] Gerar o relatório de matemática e os dois decks.
- [ ] Gerar os ZIPs.
- [ ] Conferir nomes e RMs no README, nos decks e no firmware.
- [ ] Publicar o Wokwi e gravar o vídeo de Edge.
- [ ] Gravar o vídeo de 3 minutos e publicar no YouTube.
- [ ] Fazer o deploy e copiar a URL para o README.
- [ ] Confirmar que os professores abrem o repositório no GitHub.
- [ ] Submeter cada disciplina separadamente no Teams.
- [ ] Abrir os links em janela anônima antes de entregar.

## Materiais de apoio

- [`../PLANO-DE-ENTREGA.md`](../PLANO-DE-ENTREGA.md) — documento mestre de
  entrega e de vitória, com cronograma, playbooks e riscos.
- [`demo-90s.md`](demo-90s.md) — roteiro cronometrado da demonstração, plano B e
  ensaio para a banca e para o vídeo.
- [`../design/research/interview-kit.md`](../design/research/interview-kit.md) —
  roteiro de três conversas, termo de consentimento e uso honesto das falas.
- [`../design/presentation/rubrica-review.md`](../design/presentation/rubrica-review.md)
  — revisão do deck de Experience contra os 100 pontos da disciplina.

O detalhamento item a item está em [`checklist.md`](checklist.md).
