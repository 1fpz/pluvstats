# prompt.md — uso de IA na aplicação Python

Documento exigido pela disciplina **Computational Thinking with Python**. Registra
a ferramenta utilizada, os prompts representativos, o que foi produzido, como foi
validado e uma análise crítica.

## 1. Ferramenta utilizada

| Ferramenta | Finalidade |
| --- | --- |
| **DeepSeek** | auxiliar na criação de parte do código, na execução de testes e na otimização da entrega |

Nenhuma outra ferramenta de IA foi usada. Nenhum dado de campo, entrevista ou
medição física foi inventado; os cenários são os mesmos documentados no
repositório.

## 2. Interações realizadas

### Prompt 1 — estrutura da aplicação

> “Crie uma aplicação Python de terminal para a Global Solution CitizenTech, sem
> bibliotecas externas, com menu, validação, `try/except`, `match/case`, `while`,
> `for`, funções com parâmetros e retorno, listas/tuplas/dicionários e persistência
> em JSON. O tema é o PLUVSTATS: pontos de alagamento, leitura de distância,
> nível, taxa e tempo até o limite.”

**Resposta aplicada:** estrutura em `app.py`, com constantes, pontos, cenários,
funções de cálculo, funções de estado e menu principal. A equipe revisou a
separação e ajustou as mensagens.

### Prompt 2 — regras e casos de borda

> “Explique como tratar distância inválida, leitura sem leitura anterior, taxa
> negativa e limite já atingido sem quebrar o programa.”

**Resposta aplicada:** `AppError`, `validate_distance()`,
`time_to_limit_minutes()` retornando `None` quando a taxa não é positiva e
`severity_for()` escolhendo o sinal mais grave entre nível e taxa.

### Prompt 3 — persistência segura

> “Grave o estado em JSON de forma atômica e recrie o estado de exemplo se o
> arquivo estiver corrompido, sem esconder o problema do usuário.”

**Resposta aplicada:** `save_state()` com `.tmp` + `replace` e `load_state()` com
aviso explícito ao recriar o arquivo.

### Prompt 4 — testes

> “Liste casos de teste para cálculos, validações, persistência, cenários e
> recuperação de JSON corrompido. Use `unittest` e não dependa de rede.”

**Resposta aplicada:** `tests/test_app.py` com 12 testes. A equipe executou a
suíte, corrigiu a normalização de timestamps para segundos inteiros e repetiu os
testes até passar.

## 3. O que foi desenvolvido com apoio de IA

- parte da estrutura do menu e dos submenus;
- funções de nível, taxa, tempo até o limite e severidade;
- gravação/leitura do JSON e recuperação de arquivo inválido;
- cenários de exemplo e relatório consolidado;
- testes automatizados;
- revisão deste documento e do `readme.md`.

## 4. Como a equipe validou

1. Leu cada função e conferiu as fórmulas com
   `mathematics/model/pluvstats_model.py`.
2. Executou `python -m unittest discover -s tests -p "test_*.py"`: **12 testes
   aprovados**.
3. Rodou `python app.py` e testou:
   - opção inválida no menu;
   - distância com vírgula e com ponto;
   - distância fora da faixa (0 e 381);
   - texto no lugar de número;
   - leitura em ponto sem leitura anterior;
   - cenário de elevação e conferência do relatório;
   - reinício dos dados e persistência após fechar e abrir.
4. Abriu `data/estado.json` e conferiu que os campos e a origem
   (`manual`, `exemplo`, `cenário`) estavam corretos.
5. Comparou os limiares com `shared/pluvstats.config.json`.

## 5. Análise crítica

**Benefícios:** o apoio da IA acelerou a estrutura, a documentação e a criação de
casos de borda; ajudou a transformar as fórmulas do projeto em uma aplicação de
terminal coerente com o restante da solução.

**Limitações:** a IA não conhece o contexto da turma, não testa o programa no
computador da equipe e pode sugerir nomes ou fluxos que não correspondem ao
enunciado. A primeira versão calculava a taxa com timestamps de precisão
diferente da gravação, o que gerava 3,96 em vez de 4,00 cm/min; o problema só
apareceu no teste e foi corrigido normalizando os segundos.

**Dificuldades:** manter o código simples o suficiente para a disciplina, sem
dependências externas, e ao mesmo tempo cobrir todos os itens do PDF. A solução
foi concentrar tudo em um arquivo legível e comentado, com funções pequenas.

**Conclusão:** a IA foi usada como apoio. Cada linha entregue foi lida, executada
e ajustada pela equipe; a responsabilidade pelo código e pelas afirmações é
humana.
