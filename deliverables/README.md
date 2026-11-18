# Entregáveis — PLUVSTATS

Artefatos finais por disciplina. Todos partem do mesmo repositório e da mesma
configuração em `shared/pluvstats.config.json`.

| # | Disciplina | Artefato | Caminho |
| --- | --- | --- | --- |
| 1 | Computational Thinking with Python | aplicação de console + ZIP | [`../python-app/`](../python-app/) · `zips/pluvstats-python.zip` |
| 2 | Differentiated Problem Solving | modelo + relatório técnico | [`../mathematics/model/pluvstats_model.py`](../mathematics/model/pluvstats_model.py) · [`../mathematics/report/relatorio-tecnico.pdf`](../mathematics/report/relatorio-tecnico.pdf) |
| 3 | Edge Computing & Computer Systems | firmware + diagrama + simulação | [`../edge/esp32/`](../edge/esp32/) · [`../edge/wokwi/`](../edge/wokwi/) · <https://wokwi.com/projects/480625234214048769> |
| 4 | Front-end Design | aplicação React + repositório + ZIP | [`../frontend/`](../frontend/) · `zips/pluvstats-projeto.zip` · <https://pluvstats.vercel.app/> |
| 5 | Software & Total Experience Design | deck de 19 slides | [`../design/presentation/apresentacao.pdf`](../design/presentation/apresentacao.pdf) |
| 6 | Storytelling & Inspiração Empreendedora | marca + e-mail + deck | [`../pitch/branding.md`](../pitch/branding.md) · [`../pitch/email-investidor.md`](../pitch/email-investidor.md) · [`../pitch/apresentacao-pitch.pdf`](../pitch/apresentacao-pitch.pdf) |
| 7 | Web Development | aplicação + API + ZIP | [`../frontend/`](../frontend/) · [`../backend/`](../backend/) · `zips/pluvstats-projeto.zip` · <https://pluvstats.vercel.app/> |

## Pacotes

Os ZIPs são gerados localmente e não são versionados. Cada um leva exatamente o
que a disciplina pede, no máximo com um item de apoio:

- `zips/pluvstats-python.zip` — `app.py`, `prompt.md`, `readme.md` e os testes;
- `zips/pluvstats-aplicacao.zip` — aplicação completa para Front-end e Web:
  `frontend/`, `backend/`, `shared/`, `scripts/`, `documentation/`, `README.md`,
  `AI.md`, `TEAM.md` e `.env.example`;
- `zips/pluvstats-matematica.zip` — modelo `.py`, relatório em PDF e a
  configuração única que o modelo lê;
- `zips/pluvstats-experience.zip` — deck em PDF e o HTML editável que o gera;
- `zips/pluvstats-edge.zip` — firmware, configuração gerada, diagrama do Wokwi,
  `wokwi.toml` e `README.md`;
- `zips/pluvstats-pitch.zip` — e-mail ao investidor, diretrizes de marca e deck
  do pitch, além de `entrega-pitch.pdf` quando o documento final existir.

```powershell
powershell -ExecutionPolicy Bypass -File deliverables/build_zips.ps1
```

## Evidências

- 23 testes de frontend (Vitest), 31 de backend (pytest), 35 de matemática
  (unittest), 12 da aplicação Python e 4 de sincronização de limiares.
- Lint e build do frontend aprovados; deploy público em
  <https://pluvstats.vercel.app/>.
- Simulação do Wokwi executada com os cinco estados e publicada em
  <https://wokwi.com/projects/480625234214048769>; sem validação em hardware
  físico.
- Três entrevistas qualitativas (morador, analista municipal e motorista de
  aplicativo), registradas em
  [`../design/research/entrevistas.md`](../design/research/entrevistas.md).
- Resultados detalhados em
  [`../documentation/testing/README.md`](../documentation/testing/README.md).
