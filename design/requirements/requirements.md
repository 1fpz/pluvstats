# Requisitos — PLUVSTATS

Requisitos do protótipo acadêmico. A coluna **estado** reflete o que existe no
repositório, não uma intenção futura. Nenhum requisito depende de dados oficiais
inexistentes.

## Escopo

**Dentro do escopo**

- demonstrar o fluxo de monitoramento, triagem, registro e acompanhamento;
- operar sem backend, com dados simulados identificados;
- oferecer uma API local com SQLite;
- preparar um nó ESP32 e documentar seu contrato;
- documentar as fórmulas e os limites do modelo;
- manter proveniência explícita em todos os dados.

**Fora do escopo desta entrega**

- previsão oficial de enchentes;
- integração com a Prefeitura, Defesa Civil ou central de emergência;
- autenticação e gestão de usuários;
- deploy em nuvem, alta disponibilidade ou SLA;
- calibração hidráulica;
- uso em decisões de segurança pública.

## Requisitos funcionais

| ID | Requisito | Estado | Evidência |
| --- | --- | --- | --- |
| FR-01 | Iniciar em modo demonstração com identificação persistente e dados rotulados | Implementado | `DemoIndicator`, `data/demo*`, `shared` |
| FR-02 | Exibir visão geral com contadores, níveis, clima e atividade recente | Implementado | `OverviewPage` |
| FR-03 | Exibir mapa territorial com ocorrências, sensores e seleção por deep link | Implementado | `MapPage`, `CitizenMapPage` |
| FR-04 | Permitir CRUD de ocorrências com validação e confirmação | Implementado | `OccurrencesPage`, `OccurrenceForm` |
| FR-05 | Listar sensores com origem, qualidade, validação e série | Implementado | `SensorsPage` |
| FR-06 | Exibir alertas com severidade, métricas, reconhecimento e resolução | Implementado | `AlertsPage`, `AlertService` |
| FR-07 | Registrar intervenções vinculadas a ocorrências e exigir nível final ao concluir | Implementado | `InterventionsPage`, `InterventionService` |
| FR-08 | Gerar relatórios e indicadores agregados experimentais | Implementado | `ReportsPage`, `/api/analytics/*` |
| FR-09 | Controlar simulação: iniciar, pausar, reiniciar, cenário, nível e falhas | Implementado | `SimulationContext`, `/api/simulation/*` |
| FR-10 | Oferecer área do cidadão separada, mobile-first | Implementado | `CitizenLayout`, páginas `cidadao/*` |
| FR-11 | Permitir registro simplificado sem dados pessoais e com consentimento | Implementado | `CitizenReportPage` |
| FR-12 | Explicar limitações, segurança e ausência de acionamento de equipes | Implementado | `CitizenInfoPage` |
| FR-13 | Diagnosticar origem dos dados, fallback, hardware e simulador | Implementado | `DiagnosticsPage` |
| FR-14 | Restaurar o estado demonstrativo | Implementado | `SettingsPage`, `POST /api/demo/reset` |
| FR-15 | Servir um snapshot único para o frontend | Implementado | `GET /api/snapshot` |
| FR-16 | Aceitar leitura física somente com hardware habilitado e credencial | Implementado, não validado fisicamente | `POST /api/hardware/readings`, testes |
| FR-17 | Expor séries, bairros, estatísticas de sensor e prioridades | Implementado | `/api/analytics/*` |
| FR-18 | Ler limiares de uma única fonte compartilhada | Implementado | `shared/pluvstats.config.json` |
| FR-19 | Gerar header de limiares do firmware a partir da mesma fonte | Implementado | `edge/tools/sync_thresholds.py` |
| FR-20 | Documentar fórmulas, cenários, resultados e limitações | Implementado | `mathematics/`, `documentation/` |
| FR-21 | Manter interface utilizável sem API | Implementado | fallback em `dataSource.js` |
| FR-22 | Identificar dados de simulação, demonstração e hardware | Implementado | `source`, `simulated`, `origin`, `validated` |

## Requisitos não funcionais

| ID | Requisito | Estado | Evidência / lacuna |
| --- | --- | --- | --- |
| NFR-01 | Separação de responsabilidades entre UI, domínio, serviços, persistência e borda | Implementado | `documentation/architecture/overview.md` |
| NFR-02 | Nenhum segredo no frontend | Implementado | apenas `VITE_*` públicos; revisão manual |
| NFR-03 | Hardware nunca inferido a partir de simulação | Implementado | validação no serviço e testes de hardware |
| NFR-04 | Dados simulados sempre identificados | Implementado | badges, indicador no topo, metadados |
| NFR-05 | Testes automatizados nas regras críticas | Implementado | 23 frontend + 31 backend + 25 matemática + 4 edge |
| NFR-06 | Lint e build sem erros | Implementado | ver `documentation/testing` |
| NFR-07 | Resiliência a API indisponível | Implementado | fallback verificado em navegador |
| NFR-08 | Acessibilidade básica (skip link, foco, rótulos, contraste) | Parcial | sem auditoria WCAG ou teste com leitor de tela |
| NFR-09 | Responsividade mobile-first no cidadão | Parcial | verificado em viewport de desenvolvimento; sem teste em dispositivo físico |
| NFR-10 | Privacidade: registro do cidadão sem dados pessoais | Implementado | formulário e texto de privacidade |
| NFR-11 | Desempenho aceitável em desenvolvimento | Parcial | code splitting por rota e vendor; entrada de 299,79 kB (91,69 kB gzip); sem benchmark de rede |
| NFR-12 | Reprodutibilidade | Implementado | comandos documentados; versões fixadas no backend |
| NFR-13 | Portabilidade local | Implementado | Node 20+, Python 3.11+; SQLite |
| NFR-14 | Autenticação e autorização | Fora do escopo | lacuna explícita |
| NFR-15 | Observabilidade, backup e recuperação | Fora do escopo | lacuna explícita |
| NFR-16 | Integração oficial ou dados municipais | Fora do escopo | nenhuma credencial ou convênio |

## Regras de domínio

| ID | Regra |
| --- | --- |
| DR-01 | `h = sensorHeightCm - distanceCm`, limitado a `[0, channelDepthCm]`. |
| DR-02 | `v = Δh / Δt` em cm/min; `Δt > 0`. |
| DR-03 | `t = (h_limite - h_atual) / v` somente quando `v > 0` e `h_atual < h_limite`. |
| DR-04 | Faixas de atenção, alerta e crítico vêm do JSON compartilhado. |
| DR-05 | Histerese mantém a severidade anterior dentro da banda. |
| DR-06 | Leitura fora da faixa válida é auditada, mas não valida o dispositivo. |
| DR-07 | Leitura mais antiga que a janela configurada não comprova conectividade. |
| DR-08 | `deviceId` simulado não pode injetar hardware. |
| DR-09 | Intervenção `completed` exige `afterLevelCm` e `completedAt`. |
| DR-10 | Alerta encerrado não pode ser reconhecido novamente. |

## Rastreabilidade de páginas

| Página | Requisitos |
| --- | --- |
| Visão geral | FR-02, FR-06, FR-09 |
| Mapa | FR-03, FR-05 |
| Ocorrências | FR-04 |
| Sensores | FR-05, FR-09, FR-22 |
| Alertas | FR-06 |
| Intervenções | FR-07 |
| Relatórios | FR-08 |
| Diagnóstico | FR-13, FR-21, FR-22 |
| Configurações | FR-09, FR-14 |
| Cidadão — início | FR-10, FR-12 |
| Cidadão — mapa | FR-03, FR-10 |
| Cidadão — registrar | FR-11 |
| Cidadão — informações | FR-12 |

## Critérios de aceite desta entrega

1. O frontend inicia e navega sem API.
2. Com API, o fluxo de ocorrência persiste no SQLite.
3. O fallback é visível e não silencioso.
4. Nenhum sensor físico aparece como validado sem leitura válida.
5. Limiares não estão duplicados no código de aplicação.
6. Fórmulas e cenários têm testes reproduzíveis.
7. Documentação distingue claramente implementado, simulado, não validado e
   fora do escopo.
