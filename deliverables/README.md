# Entregáveis — PLUVSTATS

Artefatos finais por disciplina. Todos partem do mesmo repositório e da mesma
configuração em `shared/pluvstats.config.json`.

| # | Disciplina | Artefato | Caminho |
| --- | --- | --- | --- |
| 1 | Computational Thinking with Python | aplicação de console + ZIP | [`../python-app/`](../python-app/) · `zips/pluvstats-python.zip` |
| 2 | Differentiated Problem Solving | modelo + relatório técnico | [`../mathematics/model/pluvstats_model.py`](../mathematics/model/pluvstats_model.py) · [`../mathematics/report/relatorio-tecnico.pdf`](../mathematics/report/relatorio-tecnico.pdf) |
| 3 | Edge Computing & Computer Systems | firmware + diagrama + simulação | [`../edge/esp32/`](../edge/esp32/) · [`../edge/wokwi/`](../edge/wokwi/) · <https://wokwi.com/projects/480625234214048769> |
| 4 | Front-end Design | aplicação React + repositório + ZIP | [`../frontend/`](../frontend/) · `zips/pluvstats-projeto.zip` · <https://pluvstats.vercel.app/> |
| 5 | Software & Total Experience Design | deck de 18 slides | [`../design/presentation/apresentacao.pdf`](../design/presentation/apresentacao.pdf) |
| 6 | Storytelling & Inspiração Empreendedora | marca + e-mail + deck | [`../pitch/branding.md`](../pitch/branding.md) · [`../pitch/email-investidor.md`](../pitch/email-investidor.md) · [`../pitch/apresentacao-pitch.pdf`](../pitch/apresentacao-pitch.pdf) |
| 7 | Web Development | aplicação + API + ZIP | [`../frontend/`](../frontend/) · [`../backend/`](../backend/) · `zips/pluvstats-projeto.zip` · <https://pluvstats.vercel.app/> |

## Pacotes

Os ZIPs são gerados localmente e não são versionados:

- `zips/pluvstats-python.zip` — aplicação Python isolada, com `app.py`,
  `prompt.md`, `readme.md`, testes e dados de exemplo;
- `zips/pluvstats-projeto.zip` — projeto completo, sem `node_modules`, `.venv`,
  caches, builds, banco local, `.git` ou os próprios ZIPs.

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
- Resultados detalhados em
  [`../documentation/testing/README.md`](../documentation/testing/README.md).
