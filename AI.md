# AI.md — uso de IA no PLUVSTATS

Registro do uso de Inteligência Artificial no projeto, conforme exigido pelas
disciplinas de **Front-end Design** e **Web Development**.

## Ferramenta utilizada

| Ferramenta | Finalidade |
| --- | --- |
| **DeepSeek** | auxiliar na criação de parte do código, na execução de testes e na otimização da entrega |

Nenhuma outra ferramenta de IA foi usada no desenvolvimento. O produto não chama
IA em tempo de execução: não há modelo, API de IA nem serviço externo embutido na
aplicação.

## Interações representativas

| # | Prompt (síntese) | O que foi feito | Como foi validado |
| --- | --- | --- | --- |
| 1 | “Implemente o motor de alertas e a histerese reutilizando os limiares de `shared/pluvstats.config.json`.” | funções de domínio e consumo da configuração única | testes de frontend e backend, revisão dos casos de borda |
| 2 | “Escreva testes para os cenários de simulação, para o cálculo de nível e taxa e para as entradas inválidas.” | suítes de teste automatizadas | execução das suítes, lint e build |
| 3 | “Revise a área do cidadão para texto maior, linguagem simples e foco visível.” | ajustes de estilo, navegação e textos | inspeção visual, leitura do CSS e build |
| 4 | “Revise a documentação e a consistência entre as disciplinas antes da entrega.” | correções de texto, contagens e links | revisão manual contra o enunciado |

Os prompts acima são uma síntese dos pedidos feitos; não são citações literais.

## Aplicação no projeto

O apoio da IA ocorreu em:

- parte do código do frontend, do backend, do firmware, da matemática e da
  aplicação Python;
- criação e execução de testes automatizados;
- revisão de textos, nomenclatura e consistência da documentação;
- geração dos PDFs e das capturas usadas nos decks.

O projeto, as decisões de produto, o escopo e a responsabilidade pelo conteúdo
entregue são da equipe.

## Validação das respostas

Cada resposta foi tratada como rascunho e passou por:

1. leitura do código e do texto antes de aceitar;
2. execução dos testes, lint e build;
3. conferência numérica dos cenários de matemática;
4. inspeção visual das telas e dos PDFs;
5. checagem de que nenhuma lacuna foi preenchida com dado inventado.

```bash
cd frontend && npm run test && npm run lint && npm run build
cd backend && .\.venv\Scripts\python.exe -m pytest
cd .. && python -m unittest discover -s mathematics/tests -p "test_*.py"
python -m unittest discover -s python-app/tests -p "test_*.py"
python -m unittest discover -s edge/tools -p "test_*.py"
python edge/tools/sync_thresholds.py --check
```

Resultados: **23 testes de frontend, 31 de backend, 37 de matemática, 12 da
aplicação Python e 4 de sincronização de limiares**. O firmware foi executado no
Wokwi e o conjunto ESP32 + HC-SR04 passou por um teste de campo exploratório, sem
calibração metrológica.

## Análise crítica

**Benefícios.** O DeepSeek acelerou a escrita de código repetitivo, a criação de
casos de teste e a revisão de textos, liberando tempo para as decisões de produto
e para a conferência dos resultados.

**Limitações.** A IA não substitui validação: pode sugerir código que não compila,
repetir contagens antigas e escrever com confiança sobre algo que não foi
executado. Por isso, todo trecho aceito foi lido e testado pela equipe.

**Dificuldades.** Manter o escopo pequeno e a documentação coerente entre sete
disciplinas. A solução foi centralizar os limiares em um único arquivo, registrar
os limites reais do protótipo e revisar cada entrega manualmente antes do envio.

**Conclusão.** A IA foi usada como apoio à produção e à revisão. A
responsabilidade pelo código, pelas afirmações e pela entrega é humana.
