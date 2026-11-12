# PLUVSTATS Console — aplicação Python

Aplicação de terminal da Global Solution 2026.2 (CitizenTech) para a disciplina
**Computational Thinking with Python**. Ela opera os pontos monitorados do
PLUVSTATS sem depender do frontend, do backend ou de bibliotecas externas.

## O que ela faz

- lista os pontos monitorados e a última leitura de cada um;
- registra leituras manuais com validação de faixa;
- calcula nível da água, taxa de elevação (cm/min), tempo até o limite crítico e
  severidade;
- carrega três cenários de exemplo (canal estável, elevação sustentada e
  drenagem);
- mostra histórico por ponto e relatório consolidado;
- calcula o volume líquido acumulado no trecho, usando a mesma ideia de integral
  do módulo de matemática;
- persiste tudo em `data/estado.json` e permite reiniciar os dados.

## Como executar

Requisito: **Python 3.11+**. Nenhuma instalação extra.

```bash
cd python-app
python app.py
```

Para imprimir apenas o relatório consolidado e sair:

```bash
python app.py --report
```

No Windows, se `python` não estiver no PATH, use `py app.py`.

## Menu

```text
 1  Listar pontos monitorados
 2  Registrar leitura manual
 3  Gerar relatório consolidado
 4  Ver histórico de um ponto
 5  Carregar cenário de exemplo
 6  Reiniciar dados de exemplo
 0  Sair
```

Exemplo de leitura manual:

```text
ID do ponto (ex.: PS-01, ou vazio para cancelar): PS-01
Distância medida pelo sensor em cm (vazio cancela): 78,5
[ok] Leitura registrada em PS-01: nível 41,5 cm, taxa 0,4 cm/min, severidade atenção.
```

A distância é o que o sensor HC-SR04 mede: do sensor até a superfície da água. O
nível é `h = 120 - d`, limitado ao canal de 100 cm. Os limiares padrão são 25,
50 e 75 cm, iguais aos do restante do projeto.

## Persistência

O estado fica em `data/estado.json`:

```json
{
  "version": 1,
  "createdAt": "2026-11-12T18:00:00+00:00",
  "points": [{ "id": "PS-01", "name": "Rua Oratório", "neighborhood": "Vila Metalúrgica" }],
  "readings": [
    {
      "pointId": "PS-01",
      "distanceCm": 78.5,
      "levelCm": 41.5,
      "rateCmPerMin": 0.4,
      "timeToLimitMinutes": 83.75,
      "severity": "atenção",
      "origin": "manual",
      "recordedAt": "2026-11-12T18:00:00+00:00"
    }
  ]
}
```

O arquivo é gravado de forma atômica (`.tmp` + `replace`) para não corromper o
JSON se o programa for interrompido. Se o arquivo estiver ausente ou inválido, a
aplicação recria o estado de exemplo e avisa no terminal.

## Configuração compartilhada

No monorepo, a aplicação lê `shared/pluvstats.config.json` e usa os mesmos
limiares e a mesma geometria do frontend, do backend e do firmware. No ZIP
isolado da disciplina, o arquivo pode não existir; nesse caso ela usa os valores
padrão embutidos e informa a origem no menu. Nenhum dado oficial é inventado.

## Requisitos da disciplina

| Requisito do PDF | Onde aparece |
| --- | --- |
| Menu de opções | `run_menu()` e `print_menu()` |
| Validação de entradas | `validate_distance()`, `choose_point()` |
| `try/except` | leitura/gravação do JSON e tratamento de `AppError` |
| `if/elif/else` | `severity_from_value()` e `severity_for()` |
| `match/case` | menu principal e escolha de cenário |
| `while` | laço do menu e repetição da distância |
| `for` | listagem de pontos, histórico e relatório |
| Funções com parâmetros e retorno | todas as funções de cálculo e estado |
| Listas, tuplas e dicionários | pontos, leituras, limiares e cenários |
| Persistência JSON | `load_state()` e `save_state()` |
| Boas práticas | docstrings, tipos, constantes, funções pequenas |
| Boa experiência de uso | mensagens claras, cancelamento, confirmação e resumo |

## Testes

```bash
cd python-app
python -m unittest discover -s tests -p "test_*.py" -v
```

**12 testes** cobrem cálculos, validações, persistência, recuperação de JSON
corrompido, cenários e relatório. Eles não substituem um teste de usabilidade.

## Limitações

- o modelo é linear e não é previsão hidrológica;
- o volume acumulado usa um trecho hipotético de 100 m × 2 m, não calibrado;
- não há autenticação nem multiusuário;
- a aplicação não se comunica com o backend: é uma entrega independente da
  disciplina de Python;
- os dados de exemplo são identificados como `exemplo`/`cenário` no JSON.

## Uso de IA

O registro de prompts, respostas e validação está em
[`prompt.md`](prompt.md).
