# Demonstração de 90 segundos

Roteiro para a demo ao vivo na banca e para o trecho de produto dentro do vídeo de
3 minutos. A regra é simples: **mostrar o fluxo que funciona, dizer o limite e
parar.** Não é tour de telas.

## Antes de começar (T−10 min)

- [ ] `frontend` rodando em `http://127.0.0.1:5173` (ou na URL publicada).
- [ ] Se for usar a API, confirme que ela responde e que o **Diagnóstico** mostra
      origem “API”. Se não estiver, tudo bem: a demo local é o plano B.
- [ ] Abrir **Configurações → Reiniciar dados** para voltar ao estado inicial.
- [ ] Deixar o cenário em **Normal** antes de começar.
- [ ] Fechar notificações, abas pessoais, Teams, WhatsApp e terminal.
- [ ] Zoom do navegador em **100%**; janela em 1280 × 720 ou maior.
- [ ] Testar o caminho inteiro uma vez, cronometrado, sem narrar.
- [ ] Deixar uma segunda aba já aberta na **Área do cidadão**.
- [ ] Ter um vídeo gravado da demo como backup, caso o navegador falhe.

## Roteiro

| Tempo | Onde | Ação | O que dizer |
| --- | --- | --- | --- |
| 0:00–0:08 | Visão geral | pausa, sem clicar | “Este é o PLUVSTATS: o que a água está fazendo em um ponto, com origem e limite visíveis.” |
| 0:08–0:20 | Mapa urbano | abrir, selecionar um ponto | “Aqui a gestão vê o território. Cada ponto mostra estado, origem e idade da leitura — não só um número.” |
| 0:20–0:38 | Configurações | escolher **Crítico**, voltar à Visão geral | “Vou forçar o cenário crítico. Em cinco segundos o sistema recalcula nível, taxa e tempo até o limite.” |
| 0:38–0:52 | Alertas | abrir o alerta, ler a métrica, clicar **Reconhecer** | “O alerta diz o que aconteceu, qual métrica o gerou e o que fazer. Reconhecer não apaga o histórico.” |
| 0:52–1:08 | Sensores | mostrar um simulado e o `PS-05` | “Quatro sensores são simulação. O quinto é hardware preparado e **não validado** — e o sistema diz isso.” |
| 1:08–1:22 | Área do cidadão | registrar ocorrência, ver protocolo | “O cidadão registra sem nome, telefone ou documento. O protocolo é demonstrativo, não é emergência.” |
| 1:22–1:30 | Diagnóstico | rolar até a origem dos dados | “E aqui está a regra do projeto: se a API cair, a demo continua e o Diagnóstico mostra o fallback. Nada finge ser oficial.” |

**Total: 90 segundos.** Se estiver atrasado, corte o mapa (0:08–0:20) e mantenha
alertas + cidadão + diagnóstico.

## Falas que não podem faltar

- “Dado simulado aparece marcado como simulado.”
- “O hardware não foi validado em campo.”
- “O sistema não prevê enchentes e não aciona equipes.”
- “Em risco imediato, procure os canais oficiais.”

## Plano B

| Problema | O que fazer | O que não fazer |
| --- | --- | --- |
| API não responde | seguir na demo local; abrir o Diagnóstico e dizer que o fallback é intencional | reiniciar tudo no meio da fala |
| Mapa sem tiles | continuar; os marcadores continuam visíveis | pedir desculpas e parar a demo |
| Página lenta | narrar o que está carregando | clicar várias vezes |
| Erro inesperado | trocar para o vídeo de backup | abrir devtools na frente da banca |
| Dados estranhos | **Configurações → Reiniciar dados** | tentar explicar um estado que você não entende |
| Projetor pequeno | aumentar o zoom para 110% | mostrar tabela de 8 colunas |

## O que não mostrar

- terminal, logs, devtools ou erros de console;
- abas pessoais, e-mail, Teams ou notificações;
- rotas que ainda não funcionam;
- o código-fonte durante a demo (o vídeo de Edge já cobre o trecho de lógica);
- gráficos que você não sabe explicar.

## Ensaio

1. Rodar três vezes com cronômetro.
2. Na terceira, narrar sem ler o roteiro.
3. Uma pessoa conduz o mouse; outra narra. Não troquem no meio.
4. Cronometrar a troca de cenário: se passar de 8 segundos, o público sente.
5. Gravar uma tomada de tela limpa para usar como backup.

## Onde isso entra no vídeo de 3 minutos

No roteiro do pitch, a demo ocupa **0:55–1:25** (30 segundos). Use só:

1. Visão geral em estado normal;
2. cenário crítico e alerta;
3. área do cidadão com o protocolo.

O restante dos 90 segundos fica para a banca ao vivo.
