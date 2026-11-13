# Plano de entrega e de vitória — PLUVSTATS

**Global Solution 2026.2 · CitizenTech · Engenharia de Software · 1º ano · FIAP**

| Campo | Valor |
| --- | --- |
| **Prazo oficial** | 19/11/2026, às 23h55 |
| **Hoje** | 13/11/2026 (sexta-feira) |
| **Tempo restante** | 6 dias |
| **Equipe** | Felipe Ilek (RM 571322) · Michel Tatsuya Hanada (RM 571987) · Marcos Vinícius Tudisco (RM 569366) |
| **Repositório** | <https://github.com/1fpz/pluvstats> — público, branch `main` |
| **Entrega** | Teams (6 disciplinas) + Portal do aluno (Matemática) |

Este documento é o mapa completo: o que já está pronto, o que falta, como
entregar cada disciplina, o que complementar para competir de verdade e o que
fazer se algo der errado. Ele não repete o checklist item a item — ele explica
**por que** cada item existe e **qual é a consequência de não fazer**.

> **Regra que vale para todo o documento:** nada aqui autoriza inventar
> entrevista, dado oficial, deploy, validação de hardware, usuário, tração ou
> parceria. O projeto é forte justamente porque declara o que não tem. A entrega
> vencedora é honesta e completa, não uma ficção bem editada.

---

## 0. Leia esta página antes de qualquer coisa

### 0.1 O veredito em uma frase

O PLUVSTATS tem código e documentação acima da média da turma, mas **hoje não
vence** porque quatro entregas obrigatórias ainda não existem: os dois links de
Edge, o deploy de Front-end/Web, o vídeo do Pitch e a evidência humana de
Experience. Nenhuma delas se resolve com mais código — todas se resolvem com
execução humana em 6 dias.

### 0.2 Os quatro bloqueios

| # | Bloqueio | Disciplina | O que está em jogo | Tempo estimado | Consequência se não fizer |
| --- | --- | --- | --- | --- | --- |
| 1 | Wokwi não executado e não publicado | Edge | 2 links obrigatórios; 25 pts de vídeo + circuito/lógica | 1–2 h para rodar + 2–3 h para gravar | A disciplina fica sem a entrega principal |
| 2 | Deploy não publicado | Front-end e Web | Item obrigatório nas duas disciplinas | 1–2 h (frontend) + 2 h (API, opcional) | Entrega incompleta e perda de requisito explícito |
| 3 | Vídeo de 3 minutos não gravado | Pitch | 2,0 de 10 + todo o critério de storytelling | 2–3 h incluindo retakes | Nota capada em 8,0 e narrativa sem prova |
| 4 | Nenhuma conversa com pessoa real | Experience | 10 pts de problema + parte dos 25 de protótipo | 3 conversas de 25 min + 2 h de síntese | O briefing é descumprido no ponto que ele mais repete |

### 0.3 O que fazer hoje (13/11), nesta ordem

1. **Decidir o repositório.** Manter público ou tornar privado e convidar os
   professores. Ver a seção 3.4 para o trade-off. Se for convidar, peça o
   usuário do GitHub de cada professor **hoje**, pelo Teams.
2. **Publicar o frontend na Vercel.** É o item de maior retorno por hora: resolve
   um requisito de duas disciplinas e cria a URL que o vídeo e o Pitch vão usar.
3. **Abrir o Wokwi e rodar o projeto.** Não grave o vídeo antes de ver os cinco
   estados funcionando. O roteiro está pronto em `edge/ENTREGA.md`.
4. **Marcar as três conversas** para sábado e domingo. Use
   `design/research/interview-kit.md`. Sem isso, o teto de Experience continua
   baixo.
5. **Reservar um bloco de 3 h no domingo** para gravar o vídeo de 3 minutos.
6. **Não mexer em funcionalidade nova.** O código já passou de 105 testes; o que
   falta é evidência e publicação.

---

## 1. Retrato do projeto

### 1.1 O que já está pronto

| Item | Evidência |
| --- | --- |
| Monorepo com 7 disciplinas conectadas | `frontend/`, `backend/`, `edge/`, `mathematics/`, `python-app/`, `design/`, `pitch/` |
| Frontend React 19 + Vite 6 + Tailwind 3 | 36 componentes `.jsx`, 3 custom hooks, rotas de gestão e cidadão |
| Backend FastAPI + SQLite | CRUD de ocorrências, intervenções, alertas, snapshot, simulador e análise |
| Edge ESP32 + HC-SR04 + LEDs + buzzer | firmware comentado, 4 estados + falha, histerese, mediana de 5 amostras |
| Configuração única de limiares | `shared/pluvstats.config.json` lido por frontend, backend, edge e Python |
| Matemática | derivadas, integrais, limites, 5 gráficos e relatório de 8 páginas |
| Aplicação Python | menu, validação, `try/except`, `match/case`, JSON e 12 testes |
| Experience | deck de 18 páginas com os 7 entregáveis da rubrica de 100 pontos |
| Pitch | branding, e-mail ao investidor, roteiro de 3 min e deck de 10 páginas |
| Evidência automatizada | **105 testes**: 23 frontend + 31 backend + 35 matemática + 12 Python + 4 edge |
| Documentação | README narrativo, `AI.md`, `TEAM.md`, arquitetura, API, testes, deploy |
| Histórico | mais de 20 commits na `main`, acima do mínimo de 15 exigido em Front/Web |

### 1.2 O que não está pronto

| Pendência | Estado real | Onde está registrado |
| --- | --- | --- |
| Wokwi executado e público | **não executado** | `edge/ENTREGA.md` (2 placeholders) |
| Vídeo de Edge (até 7 min) | **não gravado** | `edge/ENTREGA.md` |
| Deploy do frontend | **não publicado** | `README.md` e `documentation/deploy.md` |
| Backend publicado | **não publicado** | `documentation/deploy.md` |
| Vídeo de Pitch (até 3 min) | **não gravado** | `pitch/email-investidor.md` (2 placeholders) |
| Conversas com pessoas reais | **não realizadas** | `design/research/research-plan.md` |
| Slide “O que ouvimos” | **não existe** | `design/presentation/apresentacao.html` |
| ZIPs de entrega | **desatualizados** (12/11) | `deliverables/zips/` — não versionados |
| E-mails da equipe | **`[preencher]`** | `deliverables/checklist.md` |

### 1.3 Nota potencial por disciplina (estimativa interna)

| Disciplina | Hoje | Com os pendentes resolvidos | O que limita |
| --- | --- | --- | --- |
| Computational Thinking with Python | 9,0–10,0 | 9,5–10,0 | ZIP no formato certo e nomes/RMs |
| Differentiated Problem Solving | 8,5–10,0 | 9,0–10,0 | PDF cobrir limites, derivadas e integrais com interpretação |
| Edge Computing & Computer Systems | **0–4,0** | 8,5–10,0 | Os dois links são a entrega |
| Front-end Design | 6,0–7,5 | 9,0–10,0 | Deploy, ZIP, README e acesso ao repositório |
| Software & Total Experience Design | 8,2–9,8 | 9,0–10,0 | Evidência humana e legibilidade na projeção |
| Storytelling & Inspiração Empreendedora | 8,0 | 9,5–10,0 | O vídeo vale 2,0 e ainda não existe |
| Web Development | 6,0–7,5 | 9,0–10,0 | Mesmo deploy e mesmos artefatos do Front-end |

As faixas são leitura interna, não promessa. A banca não é controlada pela
equipe; o que a equipe controla é não perder ponto por item ausente.

---

## 2. Regras da GS que afetam a entrega

| Regra | O que significa na prática |
| --- | --- |
| **Prazo: 19/11/2026, 23h55** | Não é meia-noite; é 23h55. Submeta com pelo menos 24 h de folga. |
| **Teams ou Portal, na tarefa de cada disciplina** | São 7 submissões separadas, não uma entrega única. Matemática é no Portal; as outras, no Teams. |
| **Somente um integrante envia cada disciplina** | Escolham o responsável por disciplina e registrem quem enviou. |
| **Mesma equipe e mesma CitizenTech em todas as disciplinas** | O nome PLUVSTATS, os RMs e o problema precisam ser idênticos em todos os materiais. |
| **Cada disciplina dá nota de 0 a 10** | Uma disciplina fraca não é compensada por outra forte. |
| **Formato diferente do pedido perde ponto** | Em Python, formato errado custa **10 pontos**. Nas outras, pode custar a correção. |
| **Pitch: vídeo de até 3 min no YouTube** | Público ou não listado. Vídeo privado não atende. |
| **Front/Web: repositório privado com acesso de escrita** | O repositório está público. Ver seção 3.4 para a decisão. |
| **Nomes e RMs obrigatórios** | Capa de Experience, documento do Pitch, código do Edge e entrega do Edge. |
| **Sem chamada no período, mas presença no formato da aula** | Não é motivo para relaxar a entrega; é tempo para executar. |

### 2.1 Convenção de nomes sugerida

Usem nomes claros, sem acento e sem espaço, para evitar problema de upload:

```text
pluvstats-python.zip
pluvstats-projeto.zip
pluvstats-matematica.zip          (só se o Portal aceitar um único arquivo)
pluvstats-experience.pdf
pluvstats-pitch-email.pdf
pluvstats-edge-links.txt          (opcional; o Teams aceita texto)
```

### 2.2 Prova de entrega

Depois de cada submissão:

1. Tire print da tela de confirmação com data e hora.
2. Baixe o arquivo enviado e abra-o.
3. Copie o texto exato que foi colado no Teams para um arquivo local.
4. Confirme que o link do repositório, do deploy e dos vídeos abre em janela
   anônima.
5. Guarde tudo em uma pasta local `entrega-19-11/` — fora do repositório.

### 2.3 Passo a passo de submissão

O nome exato da tarefa muda de professor para professor. O caminho é sempre
parecido:

**No Teams:**

1. Entre na **equipe da disciplina** (não no chat geral).
2. Abra a aba **Tarefas** / **Assignments**.
3. Localize a tarefa da **Global Solution** (pode estar como “GS 2026.2”,
   “CitizenTech” ou o nome da atividade).
4. Clique em **Adicionar trabalho** / **Add work**.
5. Anexe o arquivo ou cole os links no campo de texto.
6. Clique em **Entregar** / **Turn in**.
7. Confirme que o status mudou para **Entregue** e tire print.

**No Portal do aluno:**

1. Entre com o login institucional.
2. Abra a disciplina **Differentiated Problem Solving**.
3. Localize a atividade da Global Solution.
4. Anexe os arquivos e escreva o texto de identificação.
5. Envie e confirme o protocolo/comprovante.

**Se a tarefa for um link de Forms no feed do Teams:** abra o formulário, anexe
o arquivo no campo de upload e envie. Guarde o recibo do Forms.

**Erros comuns:**

- enviar no chat, não na tarefa;
- anexar só o link e esquecer o ZIP quando ele é obrigatório;
- colar link do repositório sem confirmar que o professor tem acesso;
- enviar em nome de outra pessoa;
- não clicar em **Entregar** depois de anexar;
- deixar para o dia 19 e pegar fila de upload.

### 2.4 Quem envia o quê (sugestão)

| Disciplina | Titular sugerido | Reserva | Por quê |
| --- | --- | --- | --- |
| Python | Michel | Felipe | backend e Python |
| Matemática | Marcos | Michel | modelo e relatório |
| Edge | Marcos | Felipe | firmware e Wokwi |
| Front-end | Felipe | Michel | interface e deploy |
| Experience | Felipe | Marcos | deck e narrativa |
| Pitch | Felipe | Michel | branding e vídeo |
| Web | Michel | Felipe | código, hooks e API |

O titular é quem clica em **Entregar**; a reserva confere o texto, os links e o
arquivo antes. Ninguém submete sem o outro ter revisado.

---

## 3. As sete disciplinas

Cada bloco abaixo tem a mesma estrutura: **o que o enunciado pede**, **o que já
existe**, **o que falta**, **como entregar** e **como ganhar nota**.

### 3.1 Computational Thinking with Python

**Peso:** 100 pontos — 20 aderência ao tema, 60 código (40 conceitos, 10 boas
práticas, 10 interface), 20 `prompt.md` + `readme.md`. Formato errado: −10.

#### O que o enunciado pede

- menu com as funcionalidades principais;
- validação de entradas e `try/except`;
- `if/elif/else` e `match/case`;
- `while` e `for`;
- funções com parâmetros e retorno;
- listas, tuplas e dicionários;
- persistência em JSON;
- boas práticas e boa experiência de uso;
- um **único ZIP** com os `.py`, o arquivo de IA e o `readme.md`.

#### O que já existe

- `python-app/app.py` com menu, validação, exceções, `match/case`, laços,
  funções, coleções e JSON;
- `python-app/prompt.md` com o uso de IA;
- `python-app/readme.md` com descrição e instruções;
- `python-app/tests/` com 12 testes;
- `deliverables/build_zips.ps1`, que monta o ZIP com `app.py`, `prompt.md`,
  `readme.md`, `tests/` e `data/`.

#### O que falta

1. **Regerar o ZIP.** O atual foi criado em 12/11 e está desatualizado.
2. **Conferir o conteúdo do ZIP**: `app.py`, `prompt.md`, `readme.md`, `tests/`,
   `data/`. Sem `__pycache__`, sem `estado.json`, sem `.env`.
3. **Rodar o app uma vez** e testar o menu principal, uma entrada inválida e a
   persistência.
4. **Conferir os nomes/RMs** no `readme.md` e no `prompt.md`.
5. **Decidir sobre `prompt.md` × `prompts.md`.** O enunciado cita `prompts.md` na
   página de IA e `prompt.md` na lista de entregáveis. O projeto usa
   `prompt.md`. Para cobrir a divergência sem inventar conteúdo, inclua uma
   cópia chamada `prompts.md` com o mesmo texto — ou mantenha só `prompt.md` e
   mencione no readme. O importante é o conteúdo: ferramentas, prompts,
   funcionalidades, validação e análise crítica.

#### Como entregar

- **Onde:** Teams → disciplina Computational Thinking with Python → Tarefa da
  Global Solution.
- **Quem:** um integrante.
- **O que anexar:** `pluvstats-python.zip` (um único arquivo).
- **Texto sugerido:**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Computational Thinking with Python
Projeto: PLUVSTATS — inteligência territorial para águas urbanas
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Anexo: pluvstats-python.zip
Conteúdo: app.py, prompt.md, readme.md, tests/ e data/.
O projeto é um protótipo acadêmico com dados simulados identificados.
```

#### Como ganhar nota

- O ZIP precisa abrir e o `app.py` rodar **sem dependência externa**. Teste em
  uma pasta limpa.
- O `readme.md` deve dizer o que o programa faz, como rodar e o que é simulado.
- O `prompt.md` precisa ter **exemplos reais de prompts** e **como a equipe
  validou** as respostas. Análise crítica genérica perde ponto.
- Não inclua banco, cache ou estado local no ZIP.

---

### 3.2 Differentiated Problem Solving (Matemática)

**Peso:** 100 pontos, com critérios ao lado de cada questão.

#### O que o enunciado pede

- aplicação de cálculo diferencial e integral: limites, derivadas, taxas de
  variação e integrais para grandezas acumuladas;
- modelagem de um fenômeno urbano real ligado à CitizenTech;
- código `.py` (ou `.ggb`) com implementações e gráficos;
- relatório técnico em PDF com problema, modelo, análises e interpretação.

#### O que já existe

- `mathematics/model/pluvstats_model.py` com nível, taxa, tempo até o limite,
  volume e exposição;
- `mathematics/tools/plot_scenarios.py` e 5 gráficos SVG em `mathematics/graphs/`;
- `mathematics/report/build_report.py` e `relatorio-tecnico.pdf` com 8 páginas;
- 35 testes em `mathematics/tests/`.

#### O que falta

1. **Regerar o PDF** se qualquer texto ou gráfico mudar.
2. **Conferir se o PDF cobre explicitamente**: limite de longo prazo, derivada
   como taxa, integral como acúmulo, interpretação física e limitação do modelo.
3. **Conferir os nomes/RMs** no PDF.
4. **Testar os `.py`** em uma pasta limpa: rode
   `python mathematics/tools/plot_scenarios.py` e
   `python mathematics/report/build_report.py`; o modelo em si é importado pelos
   testes, não tem `__main__`.
5. **Decidir o formato no Portal**: arquivos separados (`.py` + `.pdf`) ou um ZIP
   `pluvstats-matematica.zip` se o Portal só aceitar um arquivo.

#### Como entregar

- **Onde:** Portal do aluno → disciplina Differentiated Problem Solving →
  atividade da Global Solution.
- **Quem:** um representante do grupo.
- **O que anexar:** `.py` (modelo, gráficos e, se quiser, testes) + PDF do
  relatório.
- **Texto sugerido:**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Differentiated Problem Solving
Projeto: PLUVSTATS
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Anexos: pluvstats_model.py, plot_scenarios.py, relatorio-tecnico.pdf.
O modelo é linear e didático; não é um modelo hidrológico calibrado.
```

#### Como ganhar nota

- O relatório precisa **interpretar**, não só mostrar conta. Cada gráfico deve
  terminar com uma frase de decisão.
- Diga o que o modelo **não** faz: não prevê enchente, não calibra canal, não
  incorpora chuva.
- Use a mesma nomenclatura do frontend (normal, atenção, alerta, crítico) para
  mostrar coerência entre disciplinas.
- Se o professor valorizar originalidade, o diferencial é ligar a integral à
  exposição acumulada e ao volume no trecho — não só calcular.

---

### 3.3 Edge Computing & Computer Systems

**Peso:** 100 pontos — problema/CitizenTech 15, circuito 20, lógica de borda 25,
qualidade do código 15, vídeo 25.

#### O que o enunciado pede

- simulação no Wokwi **salva, com link público, abrindo e rodando sem ajustes**;
- diagrama organizado, fios sem cruzamentos desnecessários, código comentado;
- vídeo no YouTube de até 7 min, público ou não listado, narrado pela equipe,
  com ideia, circuito, lógica e simulação comentada;
- nomes de todos os integrantes no código-fonte e na entrega no Teams;
- **apenas os dois links** na tarefa do Teams.

#### O que já existe

- `edge/esp32/pluvstats_sensor/pluvstats_sensor.ino` comentado e com nomes/RMs;
- `edge/esp32/pluvstats_sensor/generated_config.h` sincronizado com o JSON;
- `edge/wokwi/diagram.json` com ESP32, HC-SR04, 4 LEDs, 4 resistores e buzzer;
- 4 estados + falha, histerese, mediana de 5 amostras e rejeição de leitura;
- 4 testes do gerador de limiares;
- roteiro completo em `edge/ENTREGA.md`.

#### O que falta

1. **Rodar o Wokwi** e confirmar que compila e abre sem ajustes.
2. **Percorrer os cinco estados** alterando a distância do HC-SR04.
3. **Publicar o projeto** e copiar o link público.
4. **Gravar o vídeo** de até 7 minutos.
5. **Publicar no YouTube** como público ou não listado.
6. **Preencher os dois links** em `edge/ENTREGA.md` e no Teams.

O passo a passo está na seção 4.1 e 4.2.

#### Como entregar

- **Onde:** Teams → Edge Computing & Computer Systems → Tarefa.
- **Quem:** **apenas um aluno** da equipe.
- **O que enviar:** somente os dois links + nomes/RMs no corpo da entrega.
- **Texto sugerido:**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Edge Computing & Computer Systems
Projeto: PLUVSTATS — nó de borda com ESP32
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Projeto Wokwi (público): <COLAR LINK>
Vídeo no YouTube (não listado): <COLAR LINK>

O protótipo é acadêmico, não foi validado fisicamente e não é um sistema
oficial de alerta.
```

#### Como ganhar nota

- O vídeo precisa **mostrar os cinco estados**, não só falar deles.
- Explique por que cada componente está ali: HC-SR04 mede distância; divisor de
  tensão protege o ECHO; LEDs dão resposta visual; buzzer dá resposta sonora.
- **Conferir o divisor de tensão:** o firmware documenta um divisor no ECHO, mas
  o `diagram.json` liga o pino direto ao ESP32. Para a nota de circuito, ou
  acrescente os dois resistores no Wokwi, ou explique na gravação que a
  simulação omite o divisor e que o circuito real o inclui. Não deixe a
  inconsistência sem explicação.
- Mostre o trecho de código da classificação e o `millis()`.
- Diga em voz alta: “simulação não é validação física”.
- Link privado, projeto que exige ajuste ou vídeo sem rosto/voz derrubam a nota.

---

### 3.4 Front-end Design

**Peso:** 100 pontos, com requisitos objetivos.

#### O que o enunciado pede

- React com Next.js ou Vite;
- Tailwind CSS;
- no mínimo 8 componentes reutilizáveis;
- `useState` e `useEffect`;
- no mínimo 2 custom hooks;
- separação entre lógica de negócio, acesso a dados e camada visual;
- API externa com CRUD completo;
- funcionalidades reais, não interface estática;
- no mínimo 15 commits;
- `AI.md` na raiz;
- **repositório GitHub privado com acesso de escrita**, ZIP, `README.md` e
  **link do deploy**.

#### O que já existe

- 36 componentes, 3 custom hooks (`useWeather`, `useMediaQuery`,
  `useDebouncedValue`);
- CRUD de ocorrências e intervenções via `apiRepository`, com fallback
  `demoRepository` em `localStorage`;
- `AI.md` na raiz;
- README com pré-requisitos e execução;
- 23 testes, lint e build passando;
- mais de 20 commits;
- `frontend/vercel.json` pronto.

#### O que falta

1. **Publicar o deploy** e copiar a URL para o README.
2. **Regerar o ZIP do projeto** depois das últimas mudanças.
3. **Decidir o repositório**: público ou privado com acesso de escrita.
4. **Confirmar que o professor consegue abrir** o repositório e o deploy.
5. **Testar o CRUD na URL publicada**, não só localmente.

#### A decisão do repositório

O enunciado pede repositório **privado com acesso de escrita**. O repositório
está **público**. As opções, em ordem de risco:

| Opção | Como fica | Risco |
| --- | --- | --- |
| **A. Manter público** | Qualquer pessoa abre sem convite | Não cumpre literalmente o “privado”; cumpre o acesso |
| **B. Privado + convidar professores** | Cumpre o enunciado | Precisa do usuário GitHub de cada professor; se ninguém aceitar, a banca não abre |
| **C. Privado + ZIP completo** | O ZIP garante a análise mesmo sem acesso | Ainda depende de convite para o histórico de commits |

**Recomendação:** peça hoje, no Teams, o usuário GitHub dos professores. Se
responderem até 17/11, torne privado e convide com permissão **Write**. Se não
responderem, mantenha público e escreva na entrega: “o repositório está público
para garantir o acesso imediato; posso torná-lo privado e conceder escrita se
indicarem os usuários”. Não deixe para decidir no dia 19.

#### Como entregar

- **Onde:** Teams → Front-end Design → Tarefa. **Separadamente** de Web
  Development, para o outro professor.
- **Quem:** um integrante.
- **O que enviar:** link do repositório, link do deploy, ZIP do projeto,
  `README.md` e `AI.md`. O README e o AI.md já estão no ZIP; se a tarefa permitir
  mais de um anexo, anexe os dois também separadamente e cole os links no corpo.
- **Texto sugerido:**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Front-end Design
Projeto: PLUVSTATS
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Repositório: https://github.com/1fpz/pluvstats
Deploy: <COLAR URL>
Vídeo de demonstração (opcional): <COLAR LINK, se existir>

Anexo: pluvstats-projeto.zip (código, README.md e AI.md).
O projeto roda sem backend: o repositório demonstrativo local assume e o
Diagnóstico informa o fallback. Com VITE_API_BASE_URL, o CRUD usa a API FastAPI.
```

#### Como ganhar nota

- O deploy precisa abrir em janela anônima e **funcionar de verdade**: criar,
  editar e excluir uma ocorrência.
- O README precisa ter pré-requisitos, instalação, execução e variáveis de
  ambiente. Não basta dizer “npm install”.
- O `AI.md` precisa refletir interações reais, com validação e análise crítica.
- O ZIP não pode conter `node_modules`, `.env`, banco ou build.
- Confirme que o histórico de commits está visível. Se tornar privado, o convite
  precisa ser aceito antes do prazo.

---

### 3.5 Software & Total Experience Design

**Peso:** 100 pontos — capa 5, problema 10, escopo 10, requisitos/RNF/RN 20,
caso de uso 15, protótipo/heurísticas 25, roadmap 15.

#### O que o enunciado pede

- slides publicados no Teams;
- nome do projeto, nome completo e RM de cada integrante e identificação do time;
- história coerente: problema → solução → experiência → próximos passos;
- os 7 entregáveis com justificativa, não apenas listas.

#### O que já existe

- `design/presentation/apresentacao.pdf` com 18 páginas;
- capa com equipe, nomes e RMs;
- problema, evidências (fato/hipótese/lacuna), escopo, 9 RF, 8 RNF, 8 RN, caso
  de uso, atores, protótipo, 10 heurísticas, tom de voz, roadmap, riscos e
  encerramento;
- `design/presentation/rubrica-review.md` com a leitura slide a slide.

#### O que falta

1. **Fazer as três conversas** e criar o slide **“O que ouvimos”**.
2. **Atualizar o PDF** e a contagem de páginas.
3. **Testar a legibilidade** dos slides 6, 7, 8, 13 e 15 em 1280 × 720 e, se
   possível, em projetor.
4. **Ensaiar a apresentação** em 12–15 minutos.
5. **Regerar o PDF final** depois de qualquer edição.

#### Como inserir o slide sem quebrar o deck

Os índices “04 / 18” estão fixos no HTML. Há dois caminhos:

- **Mais seguro:** substituir o slide 16 (“Decisões e riscos”) pelo slide “O que
  ouvimos”. O deck continua com 18 páginas e nenhum índice muda.
- **Se quiser manter os dois:** inserir depois do slide 4 e renumerar **todos**
  os índices e rodapés. É mais trabalhoso e mais fácil de errar.

O conteúdo mínimo do slide:

| Coluna | Conteúdo |
| --- | --- |
| Perfil | “morador do bairro X”, “analista municipal”, “técnico de campo” — sem nome |
| Fala | uma frase curta, anônima, com autorização |
| O que mudou | uma decisão concreta de produto ou de prioridade |

E uma linha de honestidade: “3 conversas exploratórias; não é uma pesquisa
estatística”.

#### Como entregar

- **Onde:** Teams → Software & Total Experience Design → Tarefa.
- **Quem:** um integrante.
- **O que anexar:** `pluvstats-experience.pdf` (ou o arquivo de slides aceito).
- **Texto sugerido:**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Software & Total Experience Design
Projeto: PLUVSTATS — da proposta ao roadmap
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Anexo: pluvstats-experience.pdf (18 slides, ou 19 se o slide “O que ouvimos”
for adicionado sem substituir o slide 16).
Os sete entregáveis da disciplina estão contemplados; o slide “O que ouvimos”
registra 3 conversas exploratórias, sem generalização estatística.
```

#### Como ganhar nota

- **Problema (10 pts):** use as falas das conversas. Uma fala vale mais que um
  parágrafo genérico.
- **Requisitos (20 pts):** cada RF/RNF/RN precisa de descrição, classificação e
  justificativa. O deck já faz isso; não leia a tabela inteira, explique o
  critério.
- **Caso de uso (15 pts):** a legibilidade do diagrama é metade da nota. Teste
  em tela pequena.
- **Protótipo (25 pts):** mostre telas reais e diga onde cada heurística aparece.
  Não basta listar princípios.
- **Roadmap (15 pts):** etapas em ordem lógica, com resultado esperado e critério
  de parada. Não invente datas.
- **Capa (5 pts):** nome do projeto, três nomes, três RMs e identificação do
  time. Já está.

---

### 3.6 Storytelling & Inspiração Empreendedora (Pitch)

**Peso:** 10 pontos — cidadão/problema 2,0; solução/valor 2,0; tecnologias 1,5;
storytelling/vídeo 2,0; branding/e-mail/arquétipo/MVV 2,5.

#### O que o enunciado pede

- **um único documento** com o texto do e-mail e o link do vídeo;
- e-mail simulado a investidor/parceiro explicando o arquétipo de marca e o
  alinhamento com missão, visão e valores;
- vídeo de até 3 minutos, com imagem e voz, slide deck, publicado no YouTube
  como público ou não listado;
- nome completo e RM de todos os integrantes.

#### O que já existe

- `pitch/email-investidor.md` com o e-mail completo e os 2 placeholders do link;
- `pitch/branding.md` com arquétipo, MVV e valores;
- `pitch/roteiro-video.md` com 9 etapas e ~430 palavras;
- `pitch/apresentacao-pitch.pdf` com 10 páginas;
- `design/presentation/rubrica-review.md` com a leitura de 8,0/10 hoje.

#### O que falta

1. **Gravar o vídeo** de até 3 minutos.
2. **Publicar no YouTube** como público ou não listado.
3. **Substituir o link** nos dois lugares do e-mail.
4. **Exportar o documento único** (e-mail + link) em PDF ou DOCX.
5. **Conferir nomes/RMs** no documento e na descrição do vídeo.
6. **Abrir o link em janela anônima.**

O passo a passo está na seção 4.5.

#### Como entregar

- **Onde:** Teams → Storytelling & Inspiração Empreendedora → Tarefa.
- **Quem:** um integrante.
- **O que anexar:** `pluvstats-pitch-email.pdf` com o e-mail e o link.
- **Texto sugerido:**

```text
Global Solution 2026.2 — CitizenTech
Disciplina: Storytelling & Inspiração Empreendedora
Projeto: PLUVSTATS
Equipe: Felipe Ilek (RM 571322), Michel Tatsuya Hanada (RM 571987),
Marcos Vinícius Tudisco (RM 569366)

Anexo: pluvstats-pitch-email.pdf (e-mail ao investidor + link do vídeo).
Vídeo: <COLAR LINK>
Duração: <2min50s, por exemplo>. Publicado como não listado no YouTube.
```

#### Como ganhar nota

- O vídeo é **2,0 pontos** e o critério de storytelling inteiro. Sem ele, o
  deck não passa de 8,0.
- As 9 etapas precisam aparecer **como história**, não como questionário.
- Rosto e voz são obrigatórios. Slide deck é obrigatório.
- O e-mail precisa explicar **por que** o arquétipo escolhido serve à estratégia,
  não só dizer “somos o Sábio”.
- O documento único precisa conter o link no corpo do e-mail.

---

### 3.7 Web Development

**Peso:** 100 pontos, mesmos requisitos de Front-end, professor diferente.

#### O que o enunciado pede

- a mesma aplicação de Front-end;
- entrega **separada** no Teams para o professor de Web;
- link do repositório privado com acesso de escrita, ZIP, `README.md`, deploy e
  `AI.md`.

#### O que já existe

Tudo o que está em 3.4. A aplicação é a mesma; o que muda é a submissão.

#### O que falta

1. **Repetir a entrega** com os mesmos artefatos, em outra tarefa.
2. **Não presumir** que o professor de Web verá a submissão de Front-end.
3. **Conferir se o ZIP é o mesmo** e se o deploy abre.

#### Como entregar

- **Onde:** Teams → Web Development → Tarefa.
- **Quem:** um integrante (pode ser o mesmo do Front-end, mas registre).
- **O que enviar:** os mesmos links e o mesmo ZIP, com texto adaptado à
  disciplina.

#### Como ganhar nota

- O professor de Web pode olhar mais o código do que a interface. Garanta que o
  README explique a separação de responsabilidades e onde estão os hooks.
- Destaque no texto: “3 custom hooks, 36 componentes, `apiRepository` +
  `demoRepository`, fallback explícito”.
- Se o deploy estiver sem API, diga isso com clareza e mostre o fallback. Não
  deixe o professor descobrir sozinho.

---

## 4. Playbooks

### 4.1 Wokwi em 90 minutos

**Objetivo:** projeto público, abrindo e rodando sem ajustes, com os cinco
estados demonstrados.

1. Crie uma conta em <https://wokwi.com> e entre.
2. **New Project → ESP32** (DevKit V1).
3. Abra a aba `diagram.json` e substitua todo o conteúdo por
   [`edge/wokwi/diagram.json`](edge/wokwi/diagram.json).
4. Abra `sketch.ino` e cole o conteúdo de
   [`edge/esp32/pluvstats_sensor/pluvstats_sensor.ino`](edge/esp32/pluvstats_sensor/pluvstats_sensor.ino).
5. Crie uma aba nova chamada `generated_config.h` e cole
   [`generated_config.h`](edge/esp32/pluvstats_sensor/generated_config.h).
6. Clique em **Play**. O sketch compila sem biblioteca externa; a rede está
   desligada por padrão (`PLUVSTATS_ENABLE_NETWORK=0`), então `secrets.h` não é
   necessário.
7. Abra o **Serial Monitor** em 115200 e confirme a telemetria.
8. Clique no HC-SR04 e ajuste a distância. Se a interface não mostrar o
   controle, edite a propriedade `distance` da peça.
9. Percorra a tabela:

| Distância | Nível | Estado | Resposta esperada |
| --- | --- | --- | --- |
| 112 cm | 8 cm | normal | LED verde, sem som |
| 90 cm | 30 cm | atenção | LED amarelo, bipe curto |
| 60 cm | 60 cm | alerta | LED laranja, dois bipes |
| 25 cm | 95 cm | crítico | LED vermelho, três bipes |
| fora da faixa | — | falha após 3 ciclos | LED amarelo piscando + erro |

10. Salve com o nome `PLUVSTATS — ESP32 Edge`.
11. Use **Share** e confirme que o projeto está **público**. Copie a URL.
12. Abra a URL em **janela anônima** e clique em Play. Se não rodar, o link não
    serve.
13. Cole o link em `edge/ENTREGA.md`, no lugar do placeholder.
14. Se o Wokwi reclamar de pinos, compare o `diagram.json` com a tabela de
    `edge/README.md`; não mude o firmware para “fazer funcionar” sem registrar.

**Sinais de que está pronto:** os quatro LEDs acendem em momentos diferentes, o
buzzer muda o padrão e o Serial Monitor mostra o estado e a telemetria JSON.

### 4.2 Vídeo de Edge (até 7 minutos)

**Objetivo:** 6 a 7 minutos, com rosto, voz, circuito, lógica e os cinco estados.

**Preparação (30 min):**

- OBS Studio ou Xbox Game Bar para a tela; celular ou webcam para o rosto.
- 1080p, 30 fps, microfone perto da boca, luz na frente.
- Wokwi já aberto, com o Serial Monitor visível.
- Roteiro de `edge/ENTREGA.md` impresso ou em segunda tela.
- Fechar notificações, Teams, WhatsApp e abas pessoais.

**Gravação (1–2 h):**

1. Grave a abertura com o rosto: nome, projeto, problema e ODS.
2. Mostre o circuito e explique cada componente.
3. Mostre o trecho da classificação e o `millis()`.
4. Volte ao Wokwi e altere a distância, narrando cada estado.
5. Termine com os limites: não é alerta oficial, não foi validado fisicamente.
6. Faça um take completo e só depois corte os erros.

**Publicação (20 min):**

- Título: `PLUVSTATS — Monitoramento de água com ESP32 | Global Solution 2026.2`.
- Descrição com os três nomes e RMs e a frase “protótipo acadêmico”.
- Visibilidade: **público** ou **não listado**. Nunca privado.
- Espere o processamento em HD e abra o link em janela anônima.
- Cole o link em `edge/ENTREGA.md`.

### 4.3 Deploy do frontend na Vercel (1–2 h)

**Objetivo:** URL pública que abre, navega e faz CRUD.

1. Crie conta em <https://vercel.com> e conecte o GitHub.
2. **Add New → Project** e importe `1fpz/pluvstats`.
3. Em **Root Directory**, escolha `frontend`.
4. Confirme **Framework Preset = Vite**.
5. Build Command = `npm run build`; Output Directory = `dist`.
6. Em **Settings → General**, ative **Include source files outside of the Root
   Directory in the Build Step**. O frontend lê
   `shared/pluvstats.config.json`; sem isso, o build falha.
7. Deixe `VITE_API_BASE_URL` **vazia** no primeiro deploy. O fallback local
   assume e o CRUD funciona em `localStorage`.
8. **Deploy** e aguarde.
9. Abra a URL e percorra o roteiro de fumaça:
   - `/` mostra o selo **Demonstração**;
   - `/mapa` seleciona um ponto;
   - `/sensores` mostra `PS-05` como **não validado**;
   - `/configuracoes` muda para **Crítico**;
   - `/alertas` reconhece um alerta;
   - `/cidadao` registra uma ocorrência e mostra o protocolo;
   - `/diagnostico` explica a origem dos dados;
   - recarregue `/cidadao/informacoes` para testar o rewrite de SPA.
10. Copie a URL para o README, na seção **Deploy**, e para
    `documentation/deploy.md`.
11. Rode o deploy de novo depois de qualquer mudança.

**Se o build falhar:**

- confira Node 20+ e `npm run build` local;
- confira o include de arquivos fora da raiz;
- confira se `shared/pluvstats.config.json` está no repositório;
- confira o alias `@` no `vite.config.js`;
- leia o log da Vercel e corrija a causa, não o sintoma.

**Limite importante:** sem API publicada, o CRUD é local por navegador e não é
compartilhado entre pessoas. O código consome API e tem `apiRepository`, mas a
URL publicada estará em modo demonstração. Isso deve ser dito — e não escondido.

### 4.4 Backend publicado (opcional, mas ideal)

**Quando fazer:** só depois do frontend no ar e do Edge resolvido. Se o tempo
apertar, pule e documente o fallback.

1. Escolha Render, Railway ou Fly.io.
2. Aponte para o repositório **na raiz**, não para `backend/`, porque o backend
   lê `shared/pluvstats.config.json` em `PROJECT_ROOT`.
3. Build: `pip install -r backend/requirements.txt`.
4. Start: `cd backend && uvicorn app.main:create_app --factory --host 0.0.0.0 --port $PORT`.
5. Variáveis:
   - `PLUVSTATS_ENV=demo`
   - `PLUVSTATS_DB_PATH=backend/data/pluvstats.db`
   - `PLUVSTATS_CORS_ORIGINS=https://<sua-url-vercel>`
   - `PLUVSTATS_HARDWARE_ENABLED=false`
6. Publique e abra `/docs` para confirmar que a API responde.
7. Na Vercel, defina `VITE_API_BASE_URL=https://<sua-api>` e faça **Redeploy**.
8. No app, abra **Diagnóstico** e confirme que a origem virou **API**.
9. Teste criar, editar e excluir uma ocorrência; derrube a API e confirme o
   fallback.
10. Registre a URL da API no README.

**Limite:** SQLite em disco efêmero pode perder dados a cada deploy. Para a
entrega acadêmica, documente; para produção, não serve.

### 4.5 Vídeo de Pitch (até 3 minutos)

**Objetivo:** 2min50 a 3min, com rosto, voz, slides e demonstração.

1. Abra `pitch/apresentacao-pitch.pdf` no modo apresentação.
2. Deixe o frontend aberto na **Visão geral** e no cenário **normal**.
3. Grave com OBS: uma cena com o rosto e os slides, outra com a tela do produto.
4. Siga `pitch/roteiro-video.md`; a demo entra em **0:55–1:25**.
5. Não leia o roteiro; use as frases-chave como apoio.
6. Grave um take completo, cronometre e corte só o necessário.
7. Exporte em MP4 (H.264), 1080p.
8. Publique no YouTube como **público** ou **não listado**.
9. Título: `PLUVSTATS — CitizenTech em 3 minutos | Global Solution 2026.2`.
10. Descrição com os três nomes e RMs.
11. Substitua o link nos **dois lugares** de `pitch/email-investidor.md`.
12. Exporte o e-mail + link em PDF e abra o PDF para conferir.

**Se o vídeo passar de 3 minutos:** corte a explicação de tecnologia ou o bloco
de ecossistema; nunca corte o cidadão, o problema ou o encerramento.

### 4.6 Conversas com pessoas reais (o que separa “bom” de “vencedor”)

**Objetivo:** três conversas de 20–30 minutos, com consentimento, e um slide que
mostre o que mudou no produto.

1. Leia `design/research/interview-kit.md`.
2. Escolha três perfis diferentes: cidadão, gestor/analista, técnico de campo.
3. Marque sábado (duas) e domingo (uma).
4. Leia o termo de consentimento em voz alta e registre o “concordo”.
5. Faça perguntas abertas **antes** de mostrar qualquer tela.
6. Anote sem nome, telefone, CPF ou endereço.
7. Preencha uma ficha por conversa.
8. Cruze as fichas e escolha **três falas** e **duas decisões**.
9. Crie o slide “O que ouvimos” com perfil, fala e decisão.
10. Diga também o que **não** se confirmou.
11. Atualize README, deck e personas: “hipótese parcialmente validada com 3
    conversas”, nunca “pesquisa com usuários”.
12. Regenere o PDF e atualize a contagem de páginas em todos os documentos.

**Se não der tempo:** não invente. Mantenha a declaração de hipótese e aceite o
teto. Uma entrega honesta vale mais que uma fala fabricada — e a banca pode
perguntar.

### 4.7 PDFs e ZIPs finais

**Sempre depois de qualquer edição.**

```powershell
# PDFs (Edge headless; ajuste o caminho do msedge se necessário)
$root = (Get-Location).Path
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (!(Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
$base = "file:///" + ($root -replace "\\", "/")

& $edge --headless --disable-gpu --print-to-pdf="$root\design\presentation\apresentacao.pdf" --print-to-pdf-no-header "$base/design/presentation/apresentacao.html"
& $edge --headless --disable-gpu --print-to-pdf="$root\pitch\apresentacao-pitch.pdf" --print-to-pdf-no-header "$base/pitch/apresentacao-pitch.html"
python mathematics\report\build_report.py

# ZIPs
powershell -ExecutionPolicy Bypass -File deliverables\build_zips.ps1
```

Confira:

- Experience: 18 páginas (ou 19, se inserir o slide sem substituir).
- Pitch: 10 páginas.
- Matemática: 8 páginas.
- ZIP Python: `app.py`, `prompt.md`, `readme.md`, `tests/`, `data/`.
- ZIP do projeto: sem `node_modules`, `.venv`, `dist`, `*.db`, `.env`, `.git`.

---

## 5. Cronograma 13–19/11

A divisão por pessoa é sugestão; o importante é que cada bloco tenha um dono e um
critério de fim.

| Dia | Manhã/tarde | Noite | Critério de fim do dia |
| --- | --- | --- | --- |
| **13/11 · sex** | Decidir repositório; pedir usuários GitHub aos professores; publicar frontend na Vercel | Rodar Wokwi e corrigir o que falhar | URL do deploy abre; Wokwi roda os 4 estados |
| **14/11 · sáb** | Gravar vídeo de Edge (2–3 h); publicar no YouTube | Conversas 1 e 2 | Dois links de Edge preenchidos; duas fichas de conversa |
| **15/11 · dom** | Conversa 3; criar slide “O que ouvimos”; regerar PDF de Experience | Gravar e publicar vídeo de Pitch; exportar e-mail em PDF | Slide no deck; vídeo no YouTube; link no e-mail |
| **16/11 · seg** | Publicar API (se der); regerar todos os PDFs e ZIPs | Rodar a suíte completa; corrigir o que quebrar | 105 testes verdes; artefatos atualizados |
| **17/11 · ter** | Ensaio da demo de 90 s e da apresentação de 12–15 min | Submeter Python, Matemática e Edge | Três disciplinas submetidas e conferidas |
| **18/11 · qua** | Submeter Front-end, Web, Experience e Pitch | Buffer para corrigir link ou arquivo | Sete disciplinas submetidas |
| **19/11 · qui** | Verificação final; reabrir links; baixar cópias | **Nada novo.** Só conferir | Entrega completa até 18h |

**Regra de ouro:** não use o dia 19 para produzir. Use para conferir. O prazo é
23h55, mas o upload pode falhar, o vídeo pode processar devagar e o Teams pode
pedir login de novo.

---

## 6. Checklist mestre

### 6.1 Código e artefatos

- [ ] `cd frontend && npm run test && npm run lint && npm run build`
- [ ] `cd backend && .\.venv\Scripts\python.exe -m pytest`
- [ ] `python -m unittest discover -s mathematics/tests -p "test_*.py"`
- [ ] `python -m unittest discover -s python-app/tests -p "test_*.py"`
- [ ] `python -m unittest discover -s edge/tools -p "test_*.py"`
- [ ] `python edge/tools/sync_thresholds.py --check`
- [ ] PDF de Experience regerado e conferido
- [ ] PDF de Pitch regerado e conferido
- [ ] PDF de Matemática regerado e conferido
- [ ] ZIP Python regerado e conferido
- [ ] ZIP do projeto regerado e conferido
- [ ] Nenhum `.env`, banco, segredo ou cache nos ZIPs
- [ ] Nomes e RMs conferidos em README, decks, e-mail, firmware e PDFs

### 6.2 Links e publicações

- [ ] Deploy do frontend no ar
- [ ] URL do deploy no README
- [ ] URL do deploy testada em janela anônima
- [ ] CRUD testado na URL publicada
- [ ] Rotas profundas funcionam ao recarregar
- [ ] Wokwi público e rodando sem ajustes
- [ ] Link do Wokwi testado em janela anônima
- [ ] Vídeo de Edge no YouTube, público ou não listado
- [ ] Link do vídeo de Edge testado em janela anônima
- [ ] Vídeo de Pitch no YouTube, público ou não listado
- [ ] Link do vídeo de Pitch testado em janela anônima
- [ ] Link do vídeo nos dois lugares do e-mail
- [ ] Repositório acessível aos professores
- [ ] Backend publicado e `VITE_API_BASE_URL` configurada (opcional)

### 6.3 Conteúdo e evidência

- [ ] Três conversas realizadas com consentimento
- [ ] Slide “O que ouvimos” no deck
- [ ] README atualizado com o que mudou
- [ ] Deck de Experience regerado
- [ ] Deck de Pitch regerado
- [ ] Texto do e-mail exportado em PDF
- [ ] Nenhuma afirmação de impacto, tração, parceria ou validação inexistente
- [ ] Limites de Edge e de modelo explicitados nos vídeos

### 6.4 Submissão

- [ ] Python: ZIP no Teams
- [ ] Matemática: `.py` + PDF no Portal
- [ ] Edge: dois links no Teams
- [ ] Front-end: repo + deploy + ZIP + README + `AI.md` no Teams
- [ ] Web: os mesmos artefatos, em outra tarefa
- [ ] Experience: PDF/slides no Teams
- [ ] Pitch: documento + link no Teams
- [ ] Print de cada confirmação
- [ ] Download e abertura de cada arquivo enviado
- [ ] Links reabertos em janela anônima no dia 19

---

## 7. O que complementar para vencer

Cumprir a rubrica garante nota. Vencer exige narrativa e prova. Estes são os
acréscimos de maior retorno, em ordem.

### 7.1 Slide “O que ouvimos” (maior retorno)

É o único item que ataca diretamente a exigência central do briefing: problema
real, pessoa real, perto da equipe. Três falas anônimas e duas decisões valem
mais que vinte testes novos.

### 7.2 Uma frase de posicionamento

Repita no pitch, no deck e na banca:

> **“Não é mais um painel de enchente. É a camada que diz de onde veio o dado, de
> quando ele é e o que ele não prova.”**

O tema “alagamento” é concorrido. O diferencial não é o sensor; é a
**proveniência**. Mostre isso na demo, no Diagnóstico e no selo de simulação.

### 7.3 Demo de 90 segundos ensaiada

Use `deliverables/demo-90s.md`. A banca lembra do que viu funcionar, não do que
leu. Tenha um vídeo de backup e um plano B para API fora do ar.

### 7.4 Prova de funcionamento

No deck e na fala, cite:

- 105 testes automatizados;
- lint e build sem erro;
- CRUD real;
- fallback explícito;
- configuração única de limiares;
- deploy no ar.

Números concretos vencem adjetivos.

### 7.5 Roteiro de 12–15 minutos

| Bloco | Tempo | Quem |
| --- | --- | --- |
| Capa, problema e escopo | 3 min | Felipe |
| Requisitos e caso de uso | 3 min | Michel |
| Protótipo, heurísticas e tom | 4 min | Felipe |
| Edge e matemática | 3 min | Marcos |
| Roadmap, limites e encerramento | 2 min | todos |

Ensaie a troca de fala. Não leia tabela. Escolha dois requisitos e explique o
critério.

### 7.6 Q&A preparado

Ver seção 9. A banca costuma perguntar o que vocês não têm. Responder com
clareza e limite é melhor que improvisar.

### 7.7 Acessibilidade e privacidade como diferencial

Mostre o piso tipográfico, o contraste, a linguagem simples e a ausência de
dados pessoais. Isso conversa com o briefing e com o ODS 10.

### 7.8 Reprodutibilidade

Um professor deve conseguir rodar o projeto em dois comandos. O README já faz
isso; teste em uma pasta limpa, sem cache, e corrija o que faltar.

### 7.9 Modelo de negócio, sem inventar números

O Pitch pede “oportunidade de negócio”, não planilha financeira. Uma hipótese
honesta basta:

> “O piloto seria pago por um município ou consórcio, com escopo de um ponto e
> um parceiro de drenagem. A receita não foi validada; o próximo passo é medir o
> custo por ponto e o tempo de triagem.”

Não invente TAM, usuários, receita ou parceria.

### 7.10 O que **não** fazer para “melhorar”

- Não adicione funcionalidade nova na véspera.
- Não troque a stack.
- Não invente métrica de impacto.
- Não copie slide de banco de imagens sem crédito.
- Não esconda o modo demonstração.
- Não prometa previsão de enchente.

---

## 8. Riscos e planos B

| Risco | Probabilidade | Impacto | Plano B |
| --- | --- | --- | --- |
| Wokwi não compila | Média | Alto | Conferir `generated_config.h`, rede desligada, pinos do diagram.json; gravar mesmo assim só depois de rodar |
| Vídeo de Edge passa de 7 min | Média | Médio | Cortar explicação de componente, manter os 5 estados |
| Vercel falha no build | Média | Alto | Build local, conferir include de `shared/`, Node 20, alias `@` |
| Deploy abre, mas CRUD falha | Baixa | Alto | Testar antes; se falhar, corrigir; o fallback local não substitui o teste |
| API publicada não responde | Média | Médio | Seguir sem API; documentar fallback; não fingir que está integrada |
| Professor não acessa o repo privado | Média | Alto | Manter público ou enviar ZIP completo; pedir usuário GitHub hoje |
| Vídeo do Pitch passa de 3 min | Média | Alto | Cortar tecnologia/ecossistema; manter cidadão, problema e fecho |
| Vídeo fica privado no YouTube | Baixa | Alto | Reabrir em anônimo; trocar para não listado |
| Internet cai na banca | Média | Médio | Demo local + vídeo de backup + PDF |
| Integrante falta | Baixa | Alto | Cada bloco tem dois responsáveis; ensaio com todos |
| Upload do Teams falha | Média | Alto | Submeter 24 h antes; tentar outro navegador; guardar print |
| ZIP com `.env` ou banco | Baixa | Alto | Inspecionar o ZIP antes de enviar |
| Texto afirma algo não comprovado | Média | Alto | Revisão final com a lista da seção 10 |

---

## 9. Perguntas prováveis da banca

**1. Isso não é só mais um dashboard de alagamento?**
Não. O diferencial é a camada de proveniência: origem, idade e limite em cada
dado, com fallback explícito e separação entre simulação e hardware. O painel é
a consequência, não a tese.

**2. Vocês preveem enchentes?**
Não. Calculamos nível, taxa e uma extrapolação linear até um limite. Não há
modelo hidrológico calibrado nem série histórica.

**3. De onde vêm os dados?**
Do simulador, identificados como `simulation`. Não há dado oficial, convênio ou
sensor instalado. O hardware está preparado, mas não validado.

**4. Vocês falaram com usuários?**
[Se fizeram] Falamos com três pessoas, de forma exploratória, com consentimento.
Não é pesquisa estatística. [Se não fizeram] Ainda não; é a próxima etapa e está
declarado no roadmap.

**5. Por que Santo André?**
Pela proximidade e densidade urbana do ABC. Os cinco pontos são demonstrativos;
não afirmamos ocorrência oficial em nenhum bairro.

**6. E se o sensor falhar?**
O firmware rejeita leitura inválida, usa mediana de cinco amostras e entra em
falha após três ciclos. O backend só aceita leitura física recente e válida.

**7. Qual é o modelo de negócio?**
Hipótese: piloto pago por município ou consórcio, com escopo de um ponto e
parceiro de drenagem. Receita e custo por ponto ainda não foram medidos.

**8. Por que não usaram a API da Prefeitura?**
Não há convênio, credencial ou base oficial disponível. Inventar integração
seria pior que declarar a ausência.

**9. O que a IA fez no projeto?**
Está em `AI.md` e `python-app/prompt.md`: ferramentas, prompts, o que foi
sugerido, como validamos com testes e revisão, e as limitações. A IA não
substituiu a decisão de produto.

**10. O que vocês fariam com mais um mês?**
Validar o problema com mais pessoas, calibrar o sensor em bancada, publicar a
API com banco persistente, medir tempo de triagem e testar acessibilidade com
usuários reais.

**11. Qual é a maior fraqueza?**
A ausência de validação humana e física. O código está testado; o problema e o
sensor ainda são hipóteses. Sabemos exatamente o que falta.

**12. Por que confiar em um protótipo acadêmico?**
Não pedimos confiança cega: mostramos a origem, a idade e o limite de cada dado.
A interface foi desenhada para não parecer oficial quando não é.

---

## 10. O que nunca afirmar

- que o sistema **prevê enchentes** ou alerta em tempo real;
- que há **dados oficiais** da Prefeitura, Defesa Civil ou qualquer órgão;
- que o **hardware foi validado** em campo ou em bancada;
- que o **Wokwi foi executado** enquanto não for;
- que há **usuários, entrevistas, tração ou parceria** enquanto não houver;
- que o **deploy está no ar** enquanto não estiver;
- que o modelo foi **calibrado ou validado** por especialistas;
- que o sistema **salva vidas**, aciona equipes ou substitui resgate;
- que a solução **reduziu** custo, tempo ou risco sem medição;
- que a IA “fez o projeto sozinha” ou que não foi usada.

---

## 11. Mapa de arquivos

| Preciso de… | Arquivo |
| --- | --- |
| Visão geral e ficha da CitizenTech | `README.md` |
| Checklist item a item | `deliverables/checklist.md` |
| Mapa de entrega e ZIPs | `deliverables/README.md` |
| Gerador de ZIPs | `deliverables/build_zips.ps1` |
| Demo de 90 segundos | `deliverables/demo-90s.md` |
| Kit de conversas + consentimento | `design/research/interview-kit.md` |
| Plano de pesquisa | `design/research/research-plan.md` |
| Deck de Experience | `design/presentation/apresentacao.pdf` |
| Revisão do deck contra a rubrica | `design/presentation/rubrica-review.md` |
| Diagrama de caso de uso | `design/presentation/caso-de-uso.svg` |
| E-mail ao investidor | `pitch/email-investidor.md` |
| Roteiro do vídeo de 3 min | `pitch/roteiro-video.md` |
| Deck de Pitch | `pitch/apresentacao-pitch.pdf` |
| Links e roteiro de Edge | `edge/ENTREGA.md` |
| Relatório de Matemática | `mathematics/report/relatorio-tecnico.pdf` |
| Aplicação Python | `python-app/app.py` |
| Prompt e readme do Python | `python-app/prompt.md`, `python-app/readme.md` |
| Uso de IA no projeto | `AI.md` |
| Deploy | `documentation/deploy.md` |
| Testes e evidências | `documentation/testing/README.md` |
| Equipe e organização | `TEAM.md` |

---

## 12. Comandos de verificação final

```powershell
# Frontend
cd frontend
npm run test
npm run lint
npm run build
cd ..

# Backend
cd backend
.\.venv\Scripts\python.exe -m pytest
cd ..

# Matemática, Python e Edge
python -m unittest discover -s mathematics/tests -p "test_*.py"
python -m unittest discover -s python-app/tests -p "test_*.py"
python -m unittest discover -s edge/tools -p "test_*.py"
python edge/tools/sync_thresholds.py --check

# ZIPs
powershell -ExecutionPolicy Bypass -File deliverables\build_zips.ps1

# Conferir conteúdo do ZIP Python (PowerShell)
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::OpenRead("deliverables\zips\pluvstats-python.zip").Entries |
    Select-Object FullName
```

No PowerShell, `unittest` pode mostrar “Exited with code 1” por causa do stderr,
mesmo com `$LASTEXITCODE=0`. Confie na linha `OK` e no código de saída.

---

## 13. Definições de pronto

### 13.1 Entrega completa

Todos os itens da seção 6 marcados. As sete disciplinas submetidas, com print,
arquivo baixado e link testado. Nenhuma afirmação não sustentada.

### 13.2 Entrega competitiva

Entrega completa **mais**:

- três conversas e slide “O que ouvimos”;
- deploy no ar e testado;
- os dois vídeos publicados;
- demo de 90 s ensaiada;
- narrativa de proveniência na fala e na tela;
- Q&A treinado.

### 13.3 Entrega vencedora

Não depende só da equipe: depende da banca, dos outros projetos e do critério de
desempate. O que a equipe controla é chegar sem buraco, com prova e com uma
história que se sustenta. Se isso não for suficiente para o primeiro lugar, pelo
menos não será por falta de entrega.

---

## 14. Últimas 24 horas

### T−24 h (18/11, noite)

- [ ] Sete submissões feitas ou agendadas.
- [ ] Todos os links reabertos em janela anônima.
- [ ] Todos os arquivos baixados e abertos.
- [ ] PDFs com a contagem de páginas certa.
- [ ] ZIPs sem lixo.
- [ ] Nomes/RMs conferidos em todos os materiais.

### T−2 h (19/11, 21h55)

- [ ] Nada de edição nova.
- [ ] Reabrir as sete tarefas e conferir o status “Entregue”.
- [ ] Verificar se o vídeo ainda está público ou não listado.
- [ ] Verificar se o deploy ainda abre.
- [ ] Guardar print final de cada disciplina.

### Depois de 23h55

- [ ] Não há recurso por arquivo corrompido, link privado ou upload falho.
- [ ] Guarde os comprovantes até a nota sair.

---

## 15. O que só a equipe pode fazer

Nenhum documento, script ou revisão substitui estas quatro ações:

1. **Conversar com três pessoas reais** e registrar com consentimento.
2. **Rodar o Wokwi** e gravar o vídeo de Edge.
3. **Publicar o deploy** e testar a URL.
4. **Gravar o vídeo de 3 minutos** com rosto, voz e slides.

O resto está pronto ou depende de decisão simples. Se a equipe fizer essas quatro
coisas até 18/11, o PLUVSTATS chega ao dia 19 como **candidato forte**, com uma
entrega completa e uma narrativa difícil de ignorar. Se não fizer, chega com um
código excelente e uma entrega capada — e a diferença não terá sido técnica.
