# Roteiro do videopitch — PLUVSTATS (até 3 minutos)

Roteiro para a disciplina **Storytelling & Inspiração Empreendedora**. O vídeo
precisa ter **imagem e voz de quem apresenta**, **slide deck** e link publicado
no YouTube como **público ou não listado**. A narração abaixo tem cerca de 430
palavras — em ritmo normal, cabe em 2min50 a 3min.

> Antes de gravar: leia a seção “O que não dizer”. O roteiro foi escrito para
> não transformar hipótese em fato nem simulação em impacto real.

## Estrutura e tempo

| Tempo | Etapa exigida | O que aparece na tela |
| --- | --- | --- |
| 0:00–0:15 | Abertura de impacto | chuva na janela + pergunta “você sabe o que a água está fazendo na sua rua?” |
| 0:15–0:35 | Cidadão beneficiado | pessoa caminhando em calçada alagada / tela do cidadão |
| 0:35–0:55 | Problema | três cartões: dado fragmentado, origem incerta, decisão lenta |
| 0:55–1:25 | Como a solução funciona | painel de gestão + mapa + alerta |
| 1:25–1:45 | Tecnologias | arquitetura em uma imagem |
| 1:45–2:05 | Ecossistema | gestão, cidadão, equipe de campo, parceiro municipal |
| 2:05–2:25 | Impacto e expansão | indicadores propostos, com selo “a medir” |
| 2:25–2:45 | Time | nome e RM dos três integrantes |
| 2:45–3:00 | Encerramento memorável | frase final + marca |

## Narração

### 0:00–0:15 · Abertura de impacto

**[Cena: chuva na janela. Corte para uma rua com água acumulada.]**

> Quando a chuva aperta, a pergunta que importa não é quanto já choveu. É o que a
> água está fazendo agora — e quanto tempo ainda temos.

### 0:15–0:35 · Quem é o cidadão beneficiado?

**[Cena: pessoa com sacola atravessando a calçada; idoso esperando o ônibus.]**

> Quem vive essa cena é o morador, o pedestre, o motorista, a pessoa com
> mobilidade reduzida. É também o gestor que precisa decidir onde mandar a
> equipe primeiro, muitas vezes com informação espalhada em planilhas, grupos e
> relatos sem horário nem origem.

### 0:35–0:55 · Qual problema será resolvido?

**[Slide: três cartões com “fragmentado”, “origem incerta”, “decisão lenta”.]**

> O problema não é falta de dado. É falta de contexto. Sem saber de onde veio o
> número, quando ele foi medido e o que ele não prova, a informação parece
> oficial sem ser. O cidadão não sabe se o ponto é seguro; a gestão não sabe em
> quem confiar para priorizar.

### 0:55–1:25 · Como a solução funciona?

**[Cena: tela da Visão geral, mapa e central de alertas.]**

> O PLUVSTATS transforma a distância medida por um sensor em nível de água, taxa
> de elevação e tempo até um limite crítico. Na gestão, o painel reúne mapa,
> ocorrências, sensores, alertas e intervenções. No celular, o cidadão vê um
> mapa de atenção e registra um problema sem informar nome, telefone ou
> documento.
>
> Em cada tela, a mesma regra: origem, idade e limite visíveis. Dado simulado é
> marcado como simulado. Hardware não validado aparece como não validado.

### 1:25–1:45 · Quais tecnologias são empregadas?

**[Slide: diagrama frontend → API → SQLite; ESP32 ao lado como opcional.]**

> O front-end usa React, Vite e Tailwind, com hooks e componentes reutilizáveis.
> A API é FastAPI com SQLite. O firmware ESP32 lê um sensor ultrassônico e
> classifica o estado localmente. Uma configuração única alimenta frontend,
> backend, edge e a aplicação Python — para que os limiares não divirjam.

### 1:45–2:05 · Quem participa do ecossistema?

**[Slide: quatro blocos — cidadão, gestão, campo e parceiro.]**

> O ecossistema tem quatro papéis: o cidadão, que informa e consulta; a gestão,
> que prioriza; a equipe de campo, que registra a intervenção; e o parceiro
> municipal, que define protocolo e autoriza um piloto. Nenhum deles é acionado
> automaticamente nesta entrega.

### 2:05–2:25 · Como o impacto poderá ser medido e ampliado?

**[Slide: três indicadores com selo “linha de base a medir”.]**

> O impacto será medido por três indicadores: tempo entre registro e triagem,
> percentual de pontos com origem e idade visíveis, e ocorrências com
> intervenção concluída. A expansão começa por um ponto, com calibração e
> validação — não por uma promessa de cidade inteira.

### 2:25–2:45 · Time

**[Slide com foto ou nome dos três integrantes.]**

> Somos Felipe Ilek, RM 571322, responsável por front-end e experiência do
> cidadão; Michel Tatsuya Hanada, RM 571987, backend e integração; e Marcos
> Vinícius Tudisco, RM 569366, edge e matemática. O projeto é acadêmico e foi
> construído com revisão coletiva.

### 2:45–3:00 · Encerramento memorável

**[Cena final: marca PLUVSTATS sobre a cidade à noite.]**

> O PLUVSTATS não promete parar a chuva. Ele promete algo mais honesto: mostrar o
> que sabemos, de onde sabemos e o que ainda falta descobrir. Porque decisão
> melhor começa com dado que não esconde sua origem.

## O que aparece no vídeo

- gravação de tela do protótipo em demonstração;
- slides do deck de pitch;
- rosto e voz de pelo menos um apresentador;
- nenhuma imagem de enchente real sem crédito;
- nenhuma cena de resgate ou emergência que sugira operação oficial.

## O que não dizer

- “prevê enchentes” ou “alerta em tempo real”;
- “dados oficiais da Prefeitura”;
- “já validado em campo”;
- “nossa startup tem usuários / tração / parceria”;
- “salva vidas”;
- “tecnologia revolucionária”.

## Checklist de gravação

- [ ] Reservar 3 minutos e cronometrar o ensaio.
- [ ] Gravar em local silencioso, com luz frontal.
- [ ] Compartilhar a tela em 1920 × 1080 ou 1280 × 720.
- [ ] Deixar o frontend já aberto na Visão geral e no cenário normal.
- [ ] Evitar mostrar notificações, abas pessoais ou caminhos com nome de usuário.
- [ ] Conferir áudio antes de gravar o take final.
- [ ] Exportar em MP4 (H.264) e revisar o arquivo final.

## Checklist de publicação

- [ ] Publicar no YouTube como **público** ou **não listado**.
- [ ] Título sugerido: `PLUVSTATS — CitizenTech em 3 minutos | Global Solution 2026.2`.
- [ ] Descrição com os nomes e RMs dos três integrantes.
- [ ] Abrir o link em uma janela anônima e confirmar que ele funciona.
- [ ] Copiar o link para `pitch/email-investidor.md` e para o documento de entrega.
- [ ] Submeter no Microsoft Teams com o e-mail e o link.

## Se o vídeo ainda não existir

Não invente um link e não publique um vídeo privado. Enquanto a gravação não
acontecer, o documento de entrega deve manter o marcador
`[LINK DO VÍDEO NO YOUTUBE — PÚBLICO OU NÃO LISTADO]` e a equipe deve concluir a
gravação antes do prazo de **19/11/2026, às 23h55**.
