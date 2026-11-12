# AI.md — uso de IA no PLUVSTATS

Este arquivo registra, de forma honesta, como ferramentas de IA participaram do
desenvolvimento. Nenhum dado real de campo, entrevista, pesquisa ou teste físico
foi inventado para preencher lacunas. A documentação segue o que a disciplina de
Web Development pede: ferramentas, interações representativas, aplicação no
projeto, validação e análise crítica.

## Ferramentas utilizadas

| Ferramenta | Finalidade | Onde foi usada |
| --- | --- | --- |
| **OpenCode** (agente de código) com o modelo **DeepSeek V4.1 Flash Free** | implementação, refatoração, testes, documentação e revisão de consistência | frontend, backend, edge, matemática, Python, design e pitch |
| **Microsoft Edge headless** | geração dos PDFs e capturas de tela do protótipo | relatório de matemática, decks de Experience e Pitch |
| **Vitest, pytest, unittest, ESLint e Vite** | validação automatizada do que a IA produziu | suítes de teste, lint e build |

Não foram usadas ferramentas de IA para gerar entrevistas, depoimentos, dados de
campo, métricas de mercado ou resultados de hardware. Não há outro modelo ou
serviço de IA no fluxo do produto em tempo de execução.

## Princípios

- Nenhum dado real de campo, entrevista, pesquisa ou teste físico é inventado.
- Dados simulados são identificados na interface e nos metadados
  (`source: "simulation"`, `origin: "demonstration"`, `simulated: true`).
- A IA apoia implementação, revisão e documentação; a validação continua sendo
  responsabilidade humana.
- Credenciais não são versionadas.
- Resultados de teste são registrados apenas quando o comando foi executado.
- Limitações e ausências são documentadas em vez de preenchidas com texto
  genérico.

## Prompts representativos

Os textos abaixo são uma **síntese fiel dos pedidos reais** feitos durante o
desenvolvimento. Não são citações literais e não foram reescritos para parecer
melhores do que foram.

| # | Prompt (síntese) | O que a IA fez | Como foi validado |
| --- | --- | --- | --- |
| 1 | “Estruture um monorepo para o PLUVSTATS com frontend React, API FastAPI, edge ESP32, matemática e uma configuração compartilhada.” | criou a árvore de diretórios, o `shared/pluvstats.config.json` e o ADR inicial | build, lint, inspeção da árvore e leitura dos arquivos |
| 2 | “Implemente o simulador, o motor de alertas e a histerese sem duplicar limiares entre frontend e backend.” | escreveu os motores de domínio, os testes e o consumo da configuração única | Vitest, pytest e revisão dos casos de borda |
| 3 | “Redesenhe a interface para um tema escuro profissional, com painel de gestão e área do cidadão.” | refatorou componentes, tokens, rotas e estados | navegação no navegador, lint e build |
| 4 | “Revise a acessibilidade da área do cidadão: texto maior, linguagem simples e foco visível.” | criou o escopo `.citizen-readable`, ajustou a navegação e revisou textos | inspeção visual em 500 px, leitura do CSS e build |
| 5 | “Adicione ao modelo de matemática volume acumulado, exposição integrada e limite de longo prazo, com testes.” | implementou as integrais, os testes e o gráfico SVG | 35 testes unittest e conferência dos valores esperados |
| 6 | “Gere o relatório técnico em PDF e os decks de Experience e Pitch a partir do código e das capturas reais.” | montou o HTML, o CSS de impressão e o script de geração | contagem de páginas, inspeção visual e abertura dos PDFs |
| 7 | “Encontre lacunas de entrega em cada disciplina e mantenha honestidade sobre o que não foi feito.” | produziu checklists, correções de contagem e avisos de limite | revisão manual contra o enunciado da GS |

## Aplicação no projeto

A IA foi usada para:

- gerar e refatorar código de frontend, backend, edge, matemática e Python;
- escrever testes automatizados e executar as suítes;
- revisar contratos, nomenclatura e mensagens de interface;
- produzir documentação a partir do estado real do repositório;
- gerar os PDFs e capturas usados nos decks;
- identificar e registrar lacunas em vez de simulá-las.

Trechos com participação relevante de IA:

| Área | Arquivos | Participação |
| --- | --- | --- |
| Frontend | `frontend/src/domain`, `contexts`, `pages`, `components` | estrutura, componentes, hooks, estilos e testes |
| Backend | `backend/app` e `backend/tests` | routers, serviços, persistência SQLite e testes |
| Edge | `edge/esp32`, `edge/tools` | firmware, geração de limiares e testes |
| Matemática | `mathematics/model`, `tests`, `report` | fórmulas, testes, gráficos e relatório |
| Python | `python-app/app.py` e testes | menu, validação, JSON e testes |
| Design | `design/` e `design/presentation` | requisitos, personas hipotéticas, jornadas e deck |
| Pitch | `pitch/` | branding, e-mail simulado, roteiro e deck |

## Validação das respostas

Cada resposta foi tratada como rascunho. A validação seguiu estes passos:

1. **Leitura crítica** do código e do texto antes de aceitar.
2. **Execução** dos comandos de teste, lint e build.
3. **Conferência numérica** dos cenários de matemática e dos valores esperados.
4. **Inspeção visual** das telas e dos PDFs gerados.
5. **Checagem de honestidade**: nenhuma lacuna foi preenchida com dado inventado.
6. **Revisão de escopo**: o que não existe no repositório não foi descrito como
   existente.

Comandos usados:

```bash
cd frontend && npm run test && npm run lint && npm run build
cd backend && .\.venv\Scripts\python.exe -m pytest
cd .. && python -m unittest discover -s mathematics/tests -p "test_*.py"
python -m unittest discover -s python-app/tests -p "test_*.py"
python -m unittest discover -s edge/tools -p "test_*.py"
python edge/tools/sync_thresholds.py --check
```

Resultados registrados nesta entrega: **23 testes de frontend, 31 de backend, 35
de matemática, 12 da aplicação Python e 4 de sincronização de limiares**. O
firmware não foi compilado e o Wokwi não foi executado.

## O que a IA não fez

- não realizou entrevistas, questionários ou observação de campo;
- não coletou dados oficiais;
- não testou hardware físico;
- não executou o Wokwi;
- não validou o modelo com especialistas;
- não criou credenciais, convênios ou parcerias;
- não mediu impacto social ou precisão hidrológica;
- não publicou o deploy, o vídeo ou o projeto no Wokwi.

## Análise crítica

**Benefícios.** A IA acelerou a criação de estrutura, testes e documentação, e
ajudou a manter consistência entre camadas que compartilham a mesma configuração.
Também foi útil para revisar textos e apontar lacunas de entrega.

**Limitações.** A IA não substitui validação empírica. Ela pode produzir texto
confiante sobre algo que não foi executado, repetir contagens antigas e inventar
detalhes plausíveis. Neste projeto, isso exigiu conferência manual constante,
especialmente em números de teste, links e afirmações de impacto.

**Dificuldades.** O maior risco foi transformar hipótese em fato. A mitigação foi
declarar explicitamente o que é simulado, o que é hipotético e o que não foi
testado — inclusive quando isso deixou a entrega menos “impressionante”.
A segunda dificuldade foi manter a paridade entre frontend, backend, edge e
matemática; a resposta foi uma fonte única de limiares e testes de sincronização.

**Conclusão.** A IA foi uma ferramenta de produção e revisão, não uma fonte de
verdade. A responsabilidade pelo conteúdo, pelos limites e pela entrega continua
sendo humana.

## Limitações do processo

- a revisão humana do conteúdo ainda é necessária antes de uso acadêmico ou
  apresentação;
- os testes verificam o que foi implementado, não a utilidade do produto;
- a documentação de design usa personas e jornadas explicitamente hipotéticas;
- o firmware não foi compilado neste ambiente;
- o frontend usa code splitting por rota e por vendor, mas não foi submetido a
  medição de desempenho em rede real;
- não há auditoria WCAG nem teste com leitor de tela.

## Como verificar

```bash
cd frontend && npm run test && npm run lint && npm run build
cd ../backend && .\.venv\Scripts\python.exe -m pytest
cd .. && python -m unittest discover -s mathematics/tests -p "test_*.py"
python -m unittest discover -s python-app/tests -p "test_*.py"
python -m unittest discover -s edge/tools -p "test_*.py"
python edge/tools/sync_thresholds.py --check
```

Evidências detalhadas: [documentation/testing](documentation/testing/README.md).
