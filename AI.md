# AI.md — uso de IA no PLUVSTATS

Este arquivo registra, de forma honesta, como ferramentas de IA participaram do
desenvolvimento. Nenhum dado real de campo, entrevista, pesquisa ou teste físico
foi inventado para preencher lacunas.

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

## Registro

| Data | Etapa | Uso | Validação |
| --- | --- | --- | --- |
| 2026-11-09 | Fundação | Estrutura inicial, configuração do monorepo e ADR | Build, lint e inspeção manual |
| 2026-11-09 | Design system | Componentes, tokens, ícones e estados | Inspeção visual e build |
| 2026-11-10 | Domínio demonstrativo | Simulador, motor de alertas, histerese e priorização | Testes Vitest |
| 2026-11-10 | Interface de gestão | Dashboard, mapa, CRUD, sensores, alertas e relatórios | Navegação em navegador e lint |
| 2026-11-10 | Área do cidadão | Mapa de atenção, registro e página de limites | Navegação e validação de formulário |
| 2026-11-11 | Backend | FastAPI, SQLite, serviços, routers e testes | 31 testes pytest |
| 2026-11-11 | Integração | Repositório HTTP, fallback e testes de contrato | 6 testes Vitest + verificação em navegador |
| 2026-11-11 | Edge | Firmware ESP32, gerador de limiares e Wokwi | 4 testes do gerador; compilação e hardware não executados |
| 2026-11-11 | Matemática | Modelo, cenários, testes e gráficos SVG | 25 testes unittest |
| 2026-11-11 | Documentação | Arquitetura, API, requisitos, personas, jornadas, pesquisa e pitch | Revisão de consistência com o código |

## O que a IA fez

- gerou e refatorou código de frontend, backend, edge e matemática;
- escreveu testes automatizados e executou as suítes;
- revisou contratos, nomenclatura e mensagens de interface;
- produziu documentação a partir do estado real do repositório;
- identificou e registrou lacunas em vez de simulá-las.

## O que a IA não fez

- não realizou entrevistas, questionários ou observação de campo;
- não coletou dados oficiais;
- não testou hardware físico;
- não executou o Wokwi;
- não validou o modelo com especialistas;
- não criou credenciais, convênios ou parcerias;
- não mediu impacto social ou precisão hidrológica.

## Limitações do processo

- a revisão humana do conteúdo ainda é necessária antes de uso acadêmico ou
  apresentação;
- os testes verificam o que foi implementado, não a utilidade do produto;
- a documentação de design usa personas e jornadas explicitamente hipotéticas;
- o firmware não foi compilado neste ambiente;
- o bundle do frontend não foi otimizado com code splitting.

## Como verificar

```bash
cd frontend && npm run test && npm run lint && npm run build
cd ../backend && .\.venv\Scripts\python.exe -m pytest
cd .. && python -m unittest discover -s mathematics/tests -p "test_*.py"
python -m unittest discover -s edge/tools -p "test_*.py"
python edge/tools/sync_thresholds.py --check
```

Evidências detalhadas: [documentation/testing](documentation/testing/README.md).
