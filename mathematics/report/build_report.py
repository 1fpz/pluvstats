#!/usr/bin/env python3
"""Build the mathematics technical report as HTML and PDF.

The report is assembled from the same model, scenarios and charts used by the
tests. The HTML is always written; the PDF is produced with Microsoft Edge in
headless mode when it is available.

Usage:
    python mathematics/report/build_report.py
    python mathematics/report/build_report.py --html-only
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from datetime import date
from pathlib import Path

REPORT_DIR = Path(__file__).resolve().parent
REPO_ROOT = REPORT_DIR.parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from mathematics.model import scenario_metrics  # noqa: E402

SCENARIOS_DIR = REPO_ROOT / "mathematics" / "scenarios"
GRAPHS_DIR = REPO_ROOT / "mathematics" / "graphs"
HTML_PATH = REPORT_DIR / "relatorio-tecnico.html"
PDF_PATH = REPORT_DIR / "relatorio-tecnico.pdf"

EDGE_CANDIDATES = [
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
]

TEAM = [
    ("Felipe Ilek", "571322", "Front-end, experiência do cidadão e identidade visual"),
    ("Michel Tatsuya Hanada", "571987", "Backend, API, persistência e integração"),
    ("Marcos Vinícius Tudisco", "569366", "Edge, matemática e validação de dados"),
]


def load_scenarios() -> list[tuple[str, dict, dict]]:
    items = []
    for path in sorted(SCENARIOS_DIR.glob("*.json")):
        scenario = json.loads(path.read_text(encoding="utf-8"))
        items.append((path.stem, scenario, scenario_metrics(scenario)))
    return items


def svg_block(filename: str, caption: str) -> str:
    source = (GRAPHS_DIR / filename).read_text(encoding="utf-8")
    return (
        f'<figure class="chart">{source}'
        f"<figcaption>{caption}</figcaption></figure>"
    )


def fmt(value: float | None, digits: int = 2) -> str:
    if value is None:
        return "indefinido"
    text = f"{value:.{digits}f}"
    return text.replace(".", ",")


def build_html() -> str:
    scenarios = load_scenarios()
    scenario_rows = "\n".join(
        f"<tr><td><code>{name}.json</code></td>"
        f"<td>{fmt(metrics['firstLevelCm'], 1)} → {fmt(metrics['lastLevelCm'], 1)}</td>"
        f"<td>{fmt(metrics['rateCmPerMin'])}</td>"
        f"<td>{fmt(metrics['timeToLimitMinutes'])}</td>"
        f"<td>{fmt(metrics['accumulatedVolumeM3'])}</td>"
        f"<td>{fmt(metrics['levelExposureCmMinutes'])}</td></tr>"
        for name, _, metrics in scenarios
    )
    team_rows = "\n".join(
        f"<tr><td>{name}</td><td>{rm}</td><td>{front}</td></tr>"
        for name, rm, front in TEAM
    )

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>PLUVSTATS — Relatório técnico de matemática</title>
<style>
  @page {{ size: A4; margin: 17mm 16mm 15mm; }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0;
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.5;
    color: #172033;
    background: #ffffff;
  }}
  h1, h2, h3 {{ color: #0b3b5c; line-height: 1.2; }}
  h1 {{ font-size: 22pt; margin: 0 0 8px; }}
  h2 {{
    font-size: 15pt;
    margin: 26px 0 8px;
    padding-bottom: 5px;
    border-bottom: 2px solid #d7e3ec;
    page-break-after: avoid;
  }}
  h3 {{ font-size: 11.5pt; margin: 16px 0 5px; page-break-after: avoid; }}
  p {{ margin: 6px 0; text-align: justify; }}
  ul, ol {{ margin: 6px 0 6px 20px; padding: 0; }}
  li {{ margin: 3px 0; }}
  code {{ font-family: "Cascadia Mono", Consolas, monospace; font-size: 9.5pt; }}
  pre {{
    background: #f3f7fa;
    border-left: 4px solid #2f7ea8;
    padding: 9px 12px;
    font-family: "Cascadia Mono", Consolas, monospace;
    font-size: 9.5pt;
    line-height: 1.4;
    white-space: pre-wrap;
    page-break-inside: avoid;
  }}
  table {{ width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9.5pt; }}
  th, td {{ border: 1px solid #cdd9e3; padding: 5px 7px; text-align: left; vertical-align: top; }}
  th {{ background: #e8f0f6; color: #0b3b5c; }}
  tbody tr:nth-child(even) {{ background: #f8fbfd; }}
  .cover {{
    min-height: 245mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
  }}
  .cover .brand {{
    margin-top: 18mm;
    padding: 22px 24px;
    background: #0b1220;
    color: #e2e8f0;
    border-radius: 12px;
  }}
  .cover .brand .product {{ font-size: 30pt; font-weight: 700; letter-spacing: 1px; }}
  .cover .brand .signature {{ color: #7dd3fc; font-size: 13pt; margin-top: 4px; }}
  .cover .brand .slogan {{ color: #94a3b8; font-size: 10.5pt; margin-top: 14px; }}
  .cover .meta {{ margin-top: 16mm; }}
  .cover .meta table {{ font-size: 10pt; }}
  .cover .meta td:first-child {{ width: 34%; font-weight: 600; color: #0b3b5c; }}
  .cover .note {{ font-size: 9pt; color: #52647a; border-top: 1px solid #d7e3ec; padding-top: 8px; }}
  .summary {{
    background: #f3f7fa;
    border: 1px solid #d7e3ec;
    border-radius: 8px;
    padding: 10px 14px;
    margin: 10px 0 14px;
  }}
  .summary strong {{ color: #0b3b5c; }}
  .badge {{
    display: inline-block;
    background: #e0f2fe;
    color: #075985;
    border-radius: 999px;
    padding: 1px 9px;
    font-size: 8.5pt;
    font-weight: 600;
  }}
  .warning {{
    background: #fff8e6;
    border: 1px solid #f0d18a;
    border-left: 4px solid #d99b1b;
    border-radius: 6px;
    padding: 9px 12px;
    margin: 10px 0;
    page-break-inside: avoid;
  }}
  .chart {{ margin: 12px 0 16px; page-break-inside: avoid; }}
  .chart svg {{ width: 100%; height: auto; border-radius: 8px; }}
  .chart figcaption {{ font-size: 8.5pt; color: #52647a; margin-top: 4px; text-align: center; }}
  .avoid {{ page-break-inside: avoid; }}
  .page-break {{ page-break-before: always; }}
  footer {{ margin-top: 25px; border-top: 1px solid #d7e3ec; padding-top: 6px; font-size: 8pt; color: #64748b; }}
</style>
</head>
<body>

<section class="cover">
  <div>
    <div class="brand">
      <div class="product">PLUVSTATS</div>
      <div class="signature">Inteligência territorial para águas urbanas</div>
      <div class="slogan">Dados que antecipam decisões</div>
    </div>
    <div class="meta">
      <h1>Relatório técnico de matemática</h1>
      <p>Modelo de nível, taxa de elevação, tempo até o limite, integrais e
      limites de longo prazo — com hipóteses explícitas.</p>
      <table>
        <tr><td>Disciplina</td><td>Differentiated Problem Solving</td></tr>
        <tr><td>Curso</td><td>Engenharia de Software · 1º ano</td></tr>
        <tr><td>Global Solution</td><td>2026.2 · CitizenTech</td></tr>
        <tr><td>Território demonstrativo</td><td>Santo André/SP</td></tr>
        <tr><td>Data do relatório</td><td>{date.today().strftime('%d/%m/%Y')}</td></tr>
      </table>
      <h3>Equipe</h3>
      <table>
        <thead><tr><th>Integrante</th><th>RM</th><th>Frente de apresentação</th></tr></thead>
        <tbody>
        {team_rows}
        </tbody>
      </table>
    </div>
  </div>
  <div class="note">
    Protótipo acadêmico experimental. Este documento não descreve um sistema em
    operação, não usa dados oficiais e não substitui a Defesa Civil ou a
    Prefeitura. Nenhuma medição de campo foi realizada.
  </div>
</section>

<h2>Resumo</h2>
<div class="summary">
  <strong>Em uma frase:</strong> o PLUVSTATS converte a distância medida por um
  sensor em nível de água, calcula a taxa de elevação e estima quanto tempo falta
  para um limite crítico, mantendo a hipótese de linearidade visível.
  <br><strong>Resultados reproduzíveis:</strong> elevação de 42 → 58 cm em 4 min
  gera +4,0 cm/min, 4,25 min até 75 cm e +32 m³ de volume no trecho; drenagem de
  62 → 44 cm gera −4,5 cm/min e −36 m³. Há <span class="badge">35 testes</span>
  automatizados.
</div>

<h2>1. Problema e pergunta</h2>
<p>
  Em um ponto de alagamento, o dado bruto do sensor é uma distância. Decidir o
  que fazer com ela exige três perguntas objetivas: <em>qual é o nível agora?</em>,
  <em>ele está subindo ou descendo, e a que velocidade?</em> e
  <em>quanto tempo resta até um limite?</em> Este relatório formaliza essas
  perguntas com funções explícitas e mostra, em cada etapa, o que o modelo
  assume.
</p>
<p>
  O escopo é deliberadamente pequeno. O objetivo não é prever enchentes, e sim
  oferecer uma camada de cálculo legível, testável e consistente entre firmware,
  backend, frontend e a aplicação Python. A mesma configuração
  (<code>shared/pluvstats.config.json</code>) alimenta todas as camadas.
</p>

<h2>2. Dados, parâmetros e hipóteses</h2>
<p>
  A tabela abaixo reproduz os parâmetros usados nos cálculos. Eles são
  <strong>parâmetros de projeto</strong>, não resultados de calibração.
</p>
<table class="avoid">
  <thead><tr><th>Parâmetro</th><th>Símbolo</th><th>Valor</th><th>Origem</th></tr></thead>
  <tbody>
    <tr><td>Altura do sensor</td><td><code>H</code></td><td>120 cm</td><td><code>sensorGeometry</code></td></tr>
    <tr><td>Profundidade do canal</td><td><code>channelDepthCm</code></td><td>100 cm</td><td><code>sensorGeometry</code></td></tr>
    <tr><td>Largura adotada do trecho</td><td><code>w</code></td><td>2,0 m</td><td><code>sensorGeometry</code></td></tr>
    <tr><td>Comprimento adotado do trecho</td><td><code>L</code></td><td>100 m</td><td><code>sensorGeometry</code></td></tr>
    <tr><td>Faixa de distância válida</td><td><code>d</code></td><td>2 a 380 cm</td><td><code>thresholds</code></td></tr>
    <tr><td>Limiares de nível</td><td>—</td><td>25 / 50 / 75 cm</td><td><code>thresholds</code></td></tr>
    <tr><td>Limiares de taxa</td><td>—</td><td>1,2 / 2,8 / 4,5 cm/min</td><td><code>thresholds</code></td></tr>
  </tbody>
</table>
<div class="warning">
  <strong>Hipóteses centrais.</strong> (1) O sensor mede verticalmente do topo do
  canal até a superfície. (2) O nível é a diferença entre a altura do sensor e a
  distância. (3) A taxa é constante no intervalo extrapolado. (4) O trecho de
  volume é retangular, com <code>w = 2 m</code> e <code>L = 100 m</code>. Nenhuma
  dessas hipóteses foi validada em campo.
</div>

<h2>3. Modelo de nível e taxa</h2>
<h3>3.1 Nível a partir da distância</h3>
<pre>h(t) = H - d(t),  com h(t) ∈ [0, channelDepthCm]</pre>
<p>
  Se a distância for maior que a altura do sensor, o canal é tratado como seco
  (<code>h = 0</code>). Se a distância for pequena a ponto de produzir uma lâmina
  maior que a profundidade do canal, o resultado satura em
  <code>channelDepthCm</code>. Distâncias negativas ou não finitas são rejeitadas
  porque o sensor não as produz e aceitá-las criaria um nível fictício.
</p>

<h3>3.2 Taxa de elevação</h3>
<pre>v = Δh / Δt = (h(t₂) - h(t₁)) / ((t₂ - t₁) / 60)   [cm/min]</pre>
<p>
  O sinal é preservado: <code>v &gt; 0</code> indica elevação,
  <code>v &lt; 0</code> indica drenagem e <code>v = 0</code> indica estabilidade.
  Um intervalo nulo é inválido, porque a razão não existe. No firmware, a
  mediana de cinco amostras reduz ruído antes desta etapa, mas não substitui
  calibração.
</p>

<h3>3.3 Tempo até o limite</h3>
<pre>t = (h_limite - h_atual) / v</pre>
<table class="avoid">
  <thead><tr><th>Situação</th><th>Resultado</th><th>Justificativa</th></tr></thead>
  <tbody>
    <tr><td><code>h_atual ≥ h_limite</code></td><td>0 min</td><td>o limite já foi atingido ou ultrapassado</td></tr>
    <tr><td><code>v ≤ 0</code></td><td>indefinido</td><td>o modelo linear nunca alcança um limite superior</td></tr>
    <tr><td><code>v &gt; 0</code></td><td><code>(h_limite - h_atual) / v</code></td><td>extrapolação enquanto <code>v</code> for constante</td></tr>
  </tbody>
</table>

<h3>3.4 Projeção e tendência</h3>
<pre>h(t + Δt) = h(t) + v · Δt
v_LSQ = 60 · Σ((tᵢ - t̄)(hᵢ - h̄)) / Σ(tᵢ - t̄)²</pre>
<p>
  A projeção é uma reta limitada ao canal. A tendência por mínimos quadrados
  descreve a série com pelo menos três pontos e timestamps distintos. Nenhuma
  das duas é uma previsão hidrológica: ambas repetem a hipótese de taxa
  constante.
</p>

<h2>4. Cálculo diferencial e integral</h2>
<h3>4.1 A derivada como taxa</h3>
<p>
  A taxa <code>v</code> é a derivada do nível em relação ao tempo,
  <code>v = dh/dt</code>, aproximada por diferenças finitas. A escolha de
  diferenças entre a primeira e a última leitura do cenário evita que ruído de
  uma única amostra domine o resultado. Para séries mais longas, a inclinação de
  mínimos quadrados é a alternativa documentada.
</p>

<h3>4.2 Volume como integral da vazão</h3>
<p>
  Em um trecho de largura <code>w</code> e comprimento <code>L</code>, a vazão
  líquida instantânea associada à variação de nível é
  <code>Q(t) = w · L · h'(t)</code>. Integrando no intervalo:
</p>
<pre>V = ∫[t₀,t₁] Q(t) dt
  = w · L · ∫[t₀,t₁] h'(t) dt
  = w · L · (h(t₁) - h(t₀)) / 100   [m³]</pre>
<p>
  O fator <code>100</code> converte centímetros em metros. O resultado é o
  <em>volume líquido</em>: positivo quando o trecho ganha volume, negativo quando
  perde. A implementação valida que a série tem pelo menos dois pontos, que os
  tempos são estritamente crescentes e que a geometria é positiva e finita.
</p>

<h3>4.3 Exposição integrada do nível</h3>
<pre>E = ∫[t₀,t₁] h(t) dt ≈ Σ (hᵢ + hᵢ₊₁)/2 · Δtᵢ / 60   [cm·min]</pre>
<p>
  A regra dos trapézios é exata para trechos lineares e suficiente para séries
  curtas. A exposição permite comparar eventos com durações diferentes: um
  nível alto por pouco tempo pode expor menos que um nível médio por muito
  tempo. Ela não é volume, não é energia e não classifica risco sozinha.
</p>

<h3>4.4 Limite de longo prazo</h3>
<pre>h_∞ = lim[t→∞] min(channelDepthCm, h₀ + v·t)
    = channelDepthCm,  se v &gt; 0
    = h₀,              se v ≤ 0</pre>
<p>
  O limite existe apenas no modelo, não no fenômeno. Ele deixa explícito por que
  a extrapolação linear é uma hipótese: se <code>v</code> permanecesse positivo
  para sempre, o nível cresceria sem limite; a saturação no fundo do canal
  impede que o código produza números fisicamente impossíveis.
</p>

<h2>5. Exemplos resolvidos</h2>
<h3>5.1 Nível, taxa e tempo até o limite</h3>
<p>
  Um sensor a 120 cm do fundo mede <code>d = 70 cm</code>:
  <code>h = 120 − 70 = 50 cm</code>. Dois minutos depois, mede
  <code>d = 65 cm</code>, então <code>h = 55 cm</code>:
</p>
<pre>v = (55 - 50) / (120 / 60) = 5 / 2 = 2,5 cm/min
t = (75 - 55) / 2,5 = 20 / 2,5 = 8 min</pre>
<p>
  Se a taxa permanecer em 2,5 cm/min, faltam <strong>8 minutos</strong> para o
  limite crítico de 75 cm.
</p>

<h3>5.2 Saturação física</h3>
<pre>d = 5 cm   → h = 115 cm → limitado a 100 cm
d = 125 cm → h = −5 cm  → limitado a 0 cm</pre>

<h3>5.3 Volume e exposição</h3>
<p>
  No cenário de elevação, o nível vai de 42 cm a 58 cm em 4 min. Com
  <code>w = 2 m</code> e <code>L = 100 m</code>:
</p>
<pre>V = 2 · 100 · (58 - 42) / 100 = 32 m³
E = ((42 + 58) / 2) · 4 = 200 cm·min</pre>
<p>
  No cenário de drenagem, o nível cai de 62 cm para 44 cm:
  <code>V = 2 · 100 · (44 − 62) / 100 = −36 m³</code> e
  <code>E = 208,75 cm·min</code>. O sinal negativo do volume indica perda de
  volume no trecho, não erro de cálculo.
</p>

<h2>6. Cenários e resultados</h2>
<p>
  Os três cenários são séries didáticas de distância no tempo. A tabela é
  reproduzida pelo mesmo código que gera os gráficos e executa os testes.
</p>
<table class="avoid">
  <thead>
    <tr><th>Cenário</th><th>Nível (cm)</th><th>Taxa (cm/min)</th><th>Até 75 cm (min)</th><th>Volume (m³)</th><th>Exposição (cm·min)</th></tr>
  </thead>
  <tbody>
    {scenario_rows}
  </tbody>
</table>
{svg_block("cenario-rising-alert.svg", "Elevação sustentada: 42 → 58 cm em 4 min, com projeção até o limite crítico.")}
{svg_block("cenario-drainage.svg", "Drenagem: 62 → 44 cm em 4 min. A taxa negativa não permite estimar tempo até um limite superior.")}
{svg_block("cenario-normal.svg", "Canal estável: oscilação de poucos centímetros em torno de 8 cm.")}
{svg_block("volume-acumulado.svg", "Volume líquido acumulado: +32 m³ na elevação, −36 m³ na drenagem e 0 m³ no canal estável.")}
{svg_block("tempo-ate-limite.svg", "Tempo até 75 cm em função do nível atual, para três taxas de referência.")}

<h2>7. Validação e testes</h2>
<p>
  A suíte usa apenas <code>unittest</code> da biblioteca padrão. Execução:
</p>
<pre>python -m unittest discover -s mathematics/tests -p "test_*.py" -v</pre>
<p><strong>35 testes aprovados.</strong> A cobertura inclui:</p>
<ul>
  <li>nível, sinal e saturação física;</li>
  <li>rejeição de distância negativa, não finita e fora da faixa;</li>
  <li>taxa em cm/min, sinal negativo e intervalo inválido;</li>
  <li>tempo até o limite com <code>v ≤ 0</code> e limite já atingido;</li>
  <li>projeção linear e saturação no canal;</li>
  <li>tendência por mínimos quadrados e validações;</li>
  <li>integrais de volume, validação de geometria e timestamps repetidos;</li>
  <li>exposição integrada pela regra dos trapézios;</li>
  <li>limite de longo prazo com taxa positiva, nula e negativa;</li>
  <li>consistência com os limiares compartilhados.</li>
</ul>
<p>
  Os testes verificam as fórmulas e as bordas do código. Eles <strong>não</strong>
  validam o modelo contra o fenômeno físico, não medem erro do HC-SR04 e não
  substituem um experimento de bancada.
</p>

<h2>8. Limitações e riscos</h2>
<ol>
  <li><strong>Modelo linear.</strong> A extrapolação supõe taxa constante; em
  campo, chuva, drenagem e obstruções alteram a taxa.</li>
  <li><strong>Sem hidráulica.</strong> Não há seção transversal, Manning, curva
  cota-vazão, escoamento superficial ou backwater.</li>
  <li><strong>Sem incerteza explícita.</strong> O modelo não propaga erro do
  sensor nem fornece intervalo de confiança.</li>
  <li><strong>Geometria hipotética.</strong> O volume usa um trecho retangular de
  2 m × 100 m; não serve para dimensionar drenagem.</li>
  <li><strong>Sensor de baixo custo.</strong> O HC-SR04 sofre com superfície
  agitada, espuma, detritos, vento e temperatura.</li>
  <li><strong>Sem previsão oficial.</strong> Nenhum resultado deve ser
  apresentado como alerta da Defesa Civil ou da Prefeitura.</li>
</ol>

<h2>9. Conclusão</h2>
<p>
  O módulo entrega um núcleo matemático pequeno, explícito e reproduzível:
  nível, taxa, tempo até o limite, projeção, tendência, volume, exposição e
  limite de longo prazo. O valor acadêmico está em mostrar o raciocínio e as
  hipóteses, não em prometer precisão. O próximo passo honesto é a bancada:
  medir distâncias conhecidas, registrar o erro do sensor e só então discutir
  calibração.
</p>

<h2>Referências</h2>
<ul>
  <li>PLUVSTATS. <code>shared/pluvstats.config.json</code> — parâmetros compartilhados.</li>
  <li>PLUVSTATS. <code>mathematics/model/pluvstats_model.py</code> — implementação de referência.</li>
  <li>PLUVSTATS. <code>mathematics/scenarios/</code> — séries didáticas usadas nos testes e gráficos.</li>
  <li>STEWART, James. <em>Cálculo</em>, volume 1. São Paulo: Cengage Learning — definição de derivada, integral definida e regra dos trapézios.</li>
  <li>FIAP. Global Solution 2026.2 — enunciado da disciplina Differentiated Problem Solving.</li>
</ul>

<footer>
  PLUVSTATS · Relatório técnico de matemática · Global Solution 2026.2 ·
  documento gerado a partir de <code>mathematics/report/build_report.py</code>.
</footer>

</body>
</html>
"""


def find_edge() -> Path | None:
    for candidate in EDGE_CANDIDATES:
        if candidate.exists():
            return candidate
    return shutil.which("msedge") and Path(shutil.which("msedge"))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--html-only", action="store_true", help="não gerar PDF")
    args = parser.parse_args()

    HTML_PATH.write_text(build_html(), encoding="utf-8", newline="\n")
    print(f"wrote {HTML_PATH.relative_to(REPO_ROOT)}")

    if args.html_only:
        return 0

    edge = find_edge()
    if edge is None:
        print("Edge não encontrado; o HTML foi gerado e o PDF não foi atualizado.")
        return 0

    subprocess.run(
        [
            str(edge),
            "--headless",
            "--disable-gpu",
            "--no-first-run",
            f"--print-to-pdf={PDF_PATH}",
            "--print-to-pdf-no-header",
            HTML_PATH.as_uri(),
        ],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if PDF_PATH.exists():
        print(f"wrote {PDF_PATH.relative_to(REPO_ROOT)}")
        return 0
    print("O Edge não gerou o PDF. Abra o HTML e imprima manualmente.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
