# Graphs — PLUVSTATS

Arquivos SVG gerados por `mathematics/tools/plot_scenarios.py` a partir de
`mathematics/scenarios/*.json` e de `shared/pluvstats.config.json`.

| Arquivo | Conteúdo |
| --- | --- |
| `cenario-normal.svg` | canal estável em torno de 8 cm |
| `cenario-rising-alert.svg` | elevação de 42 cm a 58 cm com projeção linear até 75 cm |
| `cenario-drainage.svg` | drenagem de 62 cm a 44 cm, sem projeção |
| `tempo-ate-limite.svg` | `t = (75 - h) / v` para as taxas de atenção, alerta e crítico |

Os gráficos são documentação. Não são prova de operação em campo nem previsão
oficial. Para regenerar:

```bash
python mathematics/tools/plot_scenarios.py
```

Os SVGs usam apenas biblioteca padrão do Python e devem permanecer determinísticos:
o mesmo JSON e o mesmo código produzem o mesmo arquivo.
