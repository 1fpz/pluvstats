# PLUVSTATS — slides

Texto pronto para transpor para PowerPoint, Google Slides ou Canva. Cada seção é
um slide; as notas são para quem apresenta. Não há números de mercado, tração ou
pesquisa inventados.

---

## 1. Título

**PLUVSTATS**
Inteligência territorial para águas urbanas

Dados que antecipam decisões

*Protótipo acadêmico experimental · Santo André/SP*

> Nota: apresentar-se como protótipo, não como produto em operação.

---

## 2. Problema

- Informação sobre alagamentos é fragmentada entre canais, planilhas e relatos.
- O cidadão não sabe a quem recorrer nem o que é oficial.
- A gestão precisa priorizar com pouco contexto e sem proveniência clara.
- Dados de sensores exigem calibração, manutenção e interpretação.

> Nota: não citar estatísticas sem fonte. O problema é qualitativo nesta entrega.

---

## 3. Proposta

**Uma camada de inteligência territorial com dois olhares:**

- gestão: monitorar, priorizar, registrar intervenções;
- cidadania: entender o mapa e registrar um problema.

**Princípio central:** cada dado mostra sua origem, sua idade e seu limite.

---

## 4. Duas experiências

**Gestão**
- visão geral, mapa, ocorrências, sensores, alertas, intervenções, relatórios;
- densidade e filtros;
- diagnóstico de hardware e fallback.

**Cidadão**
- mobile-first;
- mapa de atenção;
- registro simples, sem dados pessoais;
- página de segurança e limitações.

> Nota: mostrar as duas rotas; destacar que são experiências separadas.

---

## 5. Arquitetura

```text
frontend (React/Vite) ── dataSource ──┬── demo local
                                      └── API FastAPI ── SQLite
                                                 ▲
                                      ESP32 ─────┘ (opcional, não validado)

shared/pluvstats.config.json → limiares, geometria e cenários
mathematics/ → fórmulas e cenários de referência
```

- monorepo com responsabilidades separadas;
- uma fonte para os limiares;
- motores de domínio puros e testáveis;
- fallback explícito quando a API não responde.

---

## 6. Integridade dos dados

- Demonstração é o padrão.
- Simulação, demonstração e hardware têm marcadores distintos.
- Hardware só é validado com leitura física recente e válida.
- Leitura inválida é auditada, mas não promovida.
- Leitura antiga não comprova conectividade.
- Nenhum segredo no navegador.
- API fora do ar → demonstração local + aviso no Diagnóstico.

> Nota: este é o slide mais importante para a banca. Destacar as rejeições.

---

## 7. Matemática

```text
h(t) = H − d(t)
v = Δh / Δt
t = (h_limite − h_atual) / v
```

- nível em cm, taxa em cm/min, tempo em minutos;
- saturação física do canal;
- `v ≤ 0` → tempo indefinido;
- projeção linear e tendência por mínimos quadrados;
- 25 testes e cenários reproduzíveis;
- **não é** previsão hidrológica.

> Nota: mostrar um gráfico de `mathematics/graphs`.

---

## 8. Edge

- ESP32 + HC-SR04 + 4 LEDs + buzzer.
- Mediana de 5 amostras, validação de faixa.
- Classificação local com histerese.
- Header de limiares gerado do JSON compartilhado.
- Upload HTTP opcional, com chave local.
- **Status:** preparado, não compilado, não testado fisicamente, Wokwi não
  executado.

> Nota: não simular uma conexão ao vivo. Se não houver hardware, dizer isso.

---

## 9. Demonstração

1. Visão geral e banner.
2. Mapa e detalhe de ocorrência.
3. Sensores: simulado x hardware não validado.
4. Cenário crítico e alerta.
5. Reconhecimento e intervenção.
6. Registro do cidadão.
7. Diagnóstico e fallback.
8. Reset da demonstração.

> Nota: seguir o roteiro de `pitch/README.md`.

---

## 10. Evidências

- 23 testes de frontend;
- 31 testes de backend;
- 25 testes de matemática;
- 4 testes de sincronização de limiares;
- lint e build aprovados;
- integração frontend + API verificada em navegador;
- fallback verificado com API indisponível.

**Não executado:** hardware físico, Wokwi, carga, acessibilidade com usuários,
teste de segurança ofensiva.

---

## 11. Limites e ética

- Não prevê enchentes com precisão.
- Não substitui órgãos públicos.
- Não aciona equipes.
- Não usa dados oficiais.
- Não pede dados pessoais no registro do cidadão.
- Não esconde dados simulados.
- Não há autenticação nesta entrega.

> Nota: dizer explicitamente o que o projeto não é. Isso aumenta a credibilidade.

---

## 12. Próximos passos

1. Entrevistas e teste de usabilidade.
2. Compilar o firmware e executar o Wokwi.
3. Experimento de bancada com distâncias conhecidas.
4. Avaliar acessibilidade e autenticação.
5. Definir requisitos de produção com parceiros.

**Pedido:** feedback sobre utilidade, riscos e prioridades de validação.

---

## Encerramento

**PLUVSTATS**
Dados que antecipam decisões — com origem, incerteza e limite visíveis.

Obrigado.
