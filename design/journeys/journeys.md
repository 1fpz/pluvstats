# Jornadas — PLUVSTATS

Fluxos hipotéticos, derivados dos requisitos e das personas. Não são resultados
de observação de usuários reais.

## 1. Triagem matinal do gestor

**Objetivo:** decidir onde atuar primeiro.

1. Abre a **Visão geral** e confere o indicador de demonstração no topo.
2. Lê os contadores de alertas, ocorrências e sensores.
3. Abre o **Mapa** e filtra por severidade.
4. Seleciona um ponto; o painel mostra origem, nível, taxa e ocorrências.
5. Abre **Alertas** e inspeciona métricas e timeline.
6. Reconhece o alerta.
7. Abre **Intervenções** e cria uma vistoria vinculada à ocorrência.
8. Consulta **Relatórios** para a priorização explicável.

**Falhas previstas**

- API indisponível: o sistema cai para demonstração e informa no Diagnóstico.
- Alerta simulado: badge e sufixo “(simulado)” permanecem visíveis.
- Hardware sem leitura: status “não validado”, nunca “conectado”.

## 2. Registro do cidadão

**Objetivo:** informar um problema sem burocracia.

1. Abre a área do cidadão no celular.
2. Vê o mapa de atenção e a explicação de que os dados são demonstrativos.
3. Toca em **Registrar**.
4. Escolhe tipo e severidade em botões grandes.
5. Informa endereço, bairro e descrição.
6. Marca o consentimento de entendimento sobre o canal demonstrativo.
7. Envia.
8. Recebe um protocolo e lê que ele não é oficial nem aciona equipes.

**Falhas previstas**

- validação local exibe erros por campo;
- API indisponível usa o repositório local;
- texto lembra que não há dados pessoais solicitados.

## 3. Intervenção de campo

**Objetivo:** registrar antes e depois de uma ação.

1. Técnica abre **Intervenções** e seleciona a ocorrência.
2. Cria uma intervenção `planned` com equipe, local e nível inicial.
3. Inicia o atendimento (`in_progress`).
4. Conclui informando nível final e data; o formulário bloqueia a conclusão sem
   esses dados.
5. A trilha de atividade registra a atualização.
6. Se o ponto normalizar, o motor encerra o alerta automaticamente.

**Falhas previstas**

- ocorrência inexistente é rejeitada;
- campos obrigatórios ausentes geram erro de domínio claro;
- dados continuam identificados como demonstração.

## 4. Validação de hardware

**Objetivo:** saber se um dispositivo físico está realmente enviando dados.

1. Administrador habilita a ingestão com `PLUVSTATS_HARDWARE_ENABLED=true` e uma
   chave local.
2. O ESP32 envia `deviceId`, `distanceCm` e `firmwareVersion`.
3. O backend verifica dispositivo, faixa e idade da leitura.
4. Leitura válida e recente marca `validated = true`.
5. Diagnóstico mostra “hardware validado” e a idade da leitura.
6. Leitura antiga muda para `hardware_stale` e abre alerta de comunicação.
7. Leitura fora da faixa é auditada, mas não valida o dispositivo.

**Falhas previstas**

- tentativa com dispositivo simulado retorna `409`;
- chave incorreta retorna `401`;
- hardware desabilitado retorna `503`;
- nenhuma dessas respostas é mascarada na interface.

## 5. Reinício da demonstração

**Objetivo:** voltar ao estado inicial para apresentar o produto.

1. Abre **Configurações**.
2. Seleciona **Reiniciar dados**.
3. Confirma no diálogo.
4. O sistema restaura 9 ocorrências, 4 intervenções, 5 sensores (4 simulados e
   1 hardware não validado), 0 alertas e cenário Normal em execução.
5. A interface mostra um toast de confirmação.

**Falhas previstas**

- a ação é destrutiva apenas para o seed demonstrativo;
- não afeta sistemas externos;
- o texto deixa claro que não é um reset de produção.

## 6. Avaliação acadêmica

1. A banca lê o README e a arquitetura.
2. Executa as quatro suítes de teste.
3. Abre os cenários e gráficos da matemática.
4. Verifica o registro de IA e as lacunas de pesquisa.
5. Confere que hardware e Wokwi estão explicitamente não validados.

## Princípios transversais

- proveniência sempre visível;
- nenhuma promessa de emergência;
- degradação explícita;
- validação no cliente e no servidor;
- dados simulados não promovidos a hardware.
