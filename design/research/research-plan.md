# Plano de pesquisa — PLUVSTATS

Este documento descreve **o que ainda precisa ser pesquisado**. Nada aqui foi
executado. Não há entrevistas, questionários, observações de campo ou testes
físicos realizados; qualquer texto em contrário seria invenção.

## Perguntas de pesquisa

| ID | Pergunta | Método previsto |
| --- | --- | --- |
| RQ-01 | Quais informações um cidadão precisa para decidir se um ponto é seguro? | entrevistas + teste de usabilidade |
| RQ-02 | Que sinais fazem um gestor confiar (ou desconfiar) de um alerta? | entrevistas semiestruturadas |
| RQ-03 | Como reduzir registros duplicados sem pedir dados pessoais? | análise de fluxo + prototipação |
| RQ-04 | Qual o erro real do HC-SR04 em bancada? | experimento controlado |
| RQ-05 | A taxa linear é útil para triagem em janelas curtas? | análise de séries experimentais |
| RQ-06 | Quais barreiras de acessibilidade existem nas duas áreas? | auditoria + testes com usuários |

## Hipóteses

- **H1:** um mapa simples com proveniência visível reduz a confusão entre dado
  simulado e oficial.
- **H2:** exigir nível final na conclusão da intervenção melhora a qualidade do
  registro.
- **H3:** uma janela de 10–60 s para a taxa é mais estável que a diferença entre
  duas amostras consecutivas.
- **H4:** o fallback local mantém a demonstração apresentável quando a API falha.

H1–H4 são hipóteses de projeto; nenhuma foi testada com usuários ou campo.

## Métodos planejados

### 1. Entrevistas semiestruturadas

- **Participantes:** 2–3 cidadãos do entorno, 2 gestores municipais, 2 técnicos
  de campo.
- **Duração:** 30–45 min.
- **Tópicos:** rotina atual, fontes de informação, confiança em alertas,
  vocabulário, barreiras de uso.
- **Registro:** consentimento, roteiro, notas e síntese anonimizada.
- **Critério de saturação:** repetição de temas sem novos códigos relevantes.

### 2. Teste de usabilidade com tarefas

Tarefas candidatas:

1. encontrar uma ocorrência próxima no mapa do cidadão;
2. registrar um problema;
3. reconhecer um alerta e abrir a ocorrência relacionada;
4. concluir uma intervenção;
5. identificar se um sensor é simulado ou físico.

Métricas: conclusão, tempo, erros, necessidade de ajuda e compreensão das
ressalvas.

### 3. Experimento de bancada com o sensor

- distâncias conhecidas (10, 20, 40, 60, 80, 100 cm);
- superfícies: água calma, água agitada, superfície sólida;
- 30 repetições por condição;
- métricas: erro absoluto, desvio-padrão, taxa de falha;
- registrar temperatura, alimentação e versão do firmware.

Sem esse experimento, o firmware permanece **não validado**.

### 4. Análise documental

- normas e planos municipais aplicáveis;
- requisitos de acessibilidade;
- diretrizes de proteção de dados;
- literatura sobre sensores ultrassônicos e drenagem urbana.

Toda fonte deve ser citada; nenhuma credencial institucional deve ser inventada.

## Ética e privacidade

- consentimento informado antes de qualquer entrevista ou gravação;
- minimização de dados: não coletar nome, CPF, endereço residencial ou contato;
- anonimização de notas;
- armazenamento local e prazo de descarte definido;
- participantes podem encerrar a atividade a qualquer momento;
- não publicar imagens de pessoas ou placas sem autorização.

## O que existe hoje

| Item | Estado |
| --- | --- |
| Personas | hipóteses documentadas, sem entrevistas |
| Jornadas | derivadas de requisitos, sem observação |
| Testes de software | executados e registrados |
| Teste de hardware | não executado |
| Teste com usuários | não executado |
| Coleta de campo | não executada |
| Dados oficiais | não importados |
| Supabase | não conectado |

## Cronograma sugerido

1. Revisão do roteiro e do termo de consentimento.
2. Entrevistas e síntese.
3. Ajustes no protótipo.
4. Teste de usabilidade.
5. Experimento de bancada.
6. Relatório final com evidências e limitações.

## Critérios de honestidade

- não citar entrevistas que não ocorreram;
- não apresentar números de campo sem planilha ou registro;
- não chamar simulação de medição;
- não chamar o protótipo de sistema oficial;
- registrar resultados negativos e falhas.
