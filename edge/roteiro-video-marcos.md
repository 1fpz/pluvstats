# Roteiro do vídeo de Edge — Marcos

Vídeo de até **7 minutos** para **Edge Computing & Computer Systems**.
Apresentador: **Marcos Vinícius Tudisco — RM 569366**.
Projeto: **PLUVSTATS — nó de borda com ESP32**.

> Regra do vídeo: tudo o que aparece é o firmware rodando no **Wokwi**. Não dizer
> que existe hardware físico validado, sensor calibrado ou instalação em campo.

## Antes de gravar

- [ ] Abrir o projeto no Wokwi e confirmar que ele compila e roda sem ajustes.
- [ ] Abrir o **Serial Monitor** em **115200 bauds**.
- [ ] Testar os cinco estados uma vez, sem gravar.
- [ ] Fechar notificações, abas e programas que possam aparecer na tela.
- [ ] Testar o microfone e gravar em 16:9, com a tela do Wokwi legível.
- [ ] Deixar o código aberto em uma segunda janela ou aba.
- [ ] Se a disciplina pedir imagem e voz da equipe, mostrar o rosto no início e no
      fim; o restante pode ser captura de tela com narração.

### Como trocar os estados no Wokwi

A demonstração é **manual**: clique no sensor **HC-SR04**, altere o campo de
distância e espere a próxima leitura. O firmware faz cinco leituras por segundo e
publica no Serial a cada 5 segundos ou quando o estado muda.

Com o ajuste novo, **não é preciso reiniciar a simulação** para trocar de estado.
O firmware tem uma proteção de plausibilidade: se a distância mudar de uma vez e
a taxa calculada passar de **30 cm/min**, ele entende que foi um salto de leitura
(como o slider manual), descarta a janela de taxa e classifica pelo nível. No
Serial aparece:

```text
[guard] implausible slope ... cm/min ignored; rate restarted
```

Depois desse aviso, o estado acompanha o nível em uma ou duas leituras. Isso é
esperado e pode aparecer no vídeo: é a prova de que o firmware não confunde um
salto manual com uma subida real da água.

## Estrutura e tempos

| Tempo | Bloco | O que aparece |
| --- | --- | --- |
| 0:00–0:20 | Abertura | rosto ou tela com o título PLUVSTATS |
| 0:20–0:50 | Problema e cidadão | uma frase e o ponto de alagamento |
| 0:50–1:40 | O nó de borda | diagrama do Wokwi: ESP32, HC-SR04, LEDs e buzzer |
| 1:40–2:50 | Como o firmware decide | trecho do código e explicação dos limiares |
| 2:50–5:40 | Demonstração dos cinco estados | Wokwi + Serial Monitor |
| 5:40–6:30 | Código e telemetria | funções principais e JSON no Serial |
| 6:30–7:00 | Limites e fechamento | nomes, RMs e aviso de protótipo |

## Falas

### 0:00–0:20 — Abertura

> “Olá. Eu sou **Marcos Vinícius Tudisco, RM 569366**, e esta é a entrega de
> **Edge Computing & Computer Systems** do **PLUVSTATS**, um protótipo acadêmico
> de nó de borda para monitorar água em um ponto de alagamento.”

Mostre o título ou o diagrama do Wokwi.

### 0:20–0:50 — Problema e cidadão

> “Quando chove forte, o cidadão não precisa de mais um número solto. Precisa
> saber o que está acontecendo naquele ponto, se o nível está subindo e há quanto
> tempo. O PLUVSTATS organiza esse sinal com origem e limite visíveis. Este vídeo
> mostra apenas a camada de borda: o dispositivo que mede, decide localmente e
> reage mesmo sem internet.”

### 0:50–1:40 — O nó de borda e o circuito

Mostre o diagrama completo no Wokwi e vá apontando para cada componente.

> “O nó é um **ESP32** ligado a um sensor ultrassônico **HC-SR04**. O sensor fica
> no topo do canal, apontado para a água. A distância medida vira nível:
> **120 cm de altura do sensor menos a distância**. Com **100 cm de profundidade**
> de canal, a lâmina d'água fica limitada entre 0 e 100 cm.”
>
> “O HC-SR04 usa **TRIG no GPIO 5** e **ECHO no GPIO 18**. No Wokwi, o ECHO vai
> direto ao ESP32. No hardware real, é obrigatório um **divisor de tensão**,
> porque o sensor devolve 5 V e o ESP32 não é tolerante a 5 V. Os LEDs estão em
> **D25, D26, D27 e D14**, cada um com resistor de 220 ohms. O buzzer está em
> **D12**. A alimentação é 5 V e o GND é comum.”

### 1:40–2:50 — Como o firmware decide

Mostre o código, sem precisar ler linha por linha. Aponte para as funções
`readDistanceCm`, `evaluateLevel`, `evaluateRate` e `stabilize`.

> “A cada segundo o firmware faz **cinco leituras**. Ele descarta leituras fora
> da faixa de **2 a 380 cm**, exige pelo menos **três amostras válidas** e usa a
> **mediana** das cinco. Assim, um pico isolado não muda o estado.”
>
> “O nível é classificado em **normal, atenção, alerta e crítico**, com limites
> de **25, 50 e 75 cm**. A taxa de subida também entra, com limites de **1,2, 2,8
> e 4,5 cm por minuto**. O estado local é o mais severo entre nível e taxa.”
>
> “Há **histerese** de 4 cm para o nível e 0,4 cm/min para a taxa, para o estado
> não ficar piscando. Também há uma proteção contra saltos: se a taxa calculada
> passar de **30 cm/min**, o firmware descarta a janela e classifica apenas pelo
> nível. É isso que permite trocar a distância manualmente no Wokwi sem travar o
> estado.”
>
> “Se três leituras seguidas falharem, o firmware entra em **falha de sensor**:
> LED amarelo piscando e um padrão de erro no buzzer.”

### 2:50–5:40 — Demonstração dos cinco estados

Mostre o Wokwi e o Serial Monitor lado a lado. A cada mudança, espere a próxima
leitura e deixe o LED e o buzzer aparecerem antes de falar.

**Normal — 112 cm de distância, 8 cm de nível**

> “Primeiro, o estado **normal**: distância de 112 cm, nível de 8 cm. LED verde,
> sem som. O JSON mostra `severity: normal` e `simulated: true`.”

**Atenção — 90 cm de distância, 30 cm de nível**

> “Agora **atenção**: 90 cm de distância, 30 cm de nível. LED amarelo e um bipe
> curto a cada 6 segundos.”

**Alerta — 60 cm de distância, 60 cm de nível**

> “**Alerta**: 60 cm de distância, 60 cm de nível. LED laranja e dois bipes a cada
> 3 segundos.”

**Crítico — 25 cm de distância, 95 cm de nível**

> “**Crítico**: 25 cm de distância, 95 cm de nível. LED vermelho e três bipes a
> cada 2 segundos.”

**Falha — 400 cm de distância, fora da faixa válida**

> “Por último, a **falha de sensor**. Vou colocar 400 cm, acima do limite de 380
> cm. O firmware precisa de três leituras inválidas consecutivas; em alguns
> segundos o LED amarelo começa a piscar e o buzzer faz o padrão de erro. O
> último estado conhecido não é promovido a leitura válida.”

> “A troca é manual, mas a decisão é do firmware. Quando o salto é grande, aparece
> o aviso `[guard] implausible slope` e o estado passa a seguir o nível. Não é
> preciso reiniciar a simulação.”

### 5:40–6:30 — Código e telemetria

Mostre o Serial Monitor com uma linha JSON e depois o trecho principal do código.

> “No Serial, a cada 5 segundos ou quando o estado muda, sai um JSON com
> `deviceId`, `distanceCm`, `waterLevelCm`, `rateCmPerMin`, `severity`, `valid`,
> `fault`, `firmwareVersion` e `simulated`. É esse contrato que o backend usaria
> para receber a leitura.”
>
> “No código, `readDistanceCm` faz a aquisição e a mediana; `evaluateLevel` e
> `evaluateRate` aplicam os limiares; `stabilize` implementa a histerese; e
> `updateOutputs` escolhe o LED e o padrão do buzzer. O buzzer usa `tone()` e
> `noTone()` porque o componente do Wokwi só toca com uma frequência.”

> **Ponto importante:** no Wokwi, o JSON mostra **`simulated: true`** — o firmware
> foi compilado para a simulação. Isso é o correto. Só um dispositivo físico,
> compilado com `-DPLUVSTATS_SIMULATED=0`, emitiria `simulated: false`.

### 6:30–7:00 — Limites e fechamento

> “O que este vídeo **não** prova: não há hardware físico montado, o sensor não
> foi calibrado e o Wokwi não reproduz ruído, respingos ou falha de alimentação.
> O dispositivo não é um alerta oficial, não aciona a Defesa Civil e não prevê
> enchentes. É um protótipo acadêmico.”
>
> “Eu sou **Marcos Vinícius Tudisco, RM 569366**. O PLUVSTATS foi desenvolvido
> por **Felipe Ilek, RM 571322**; a integração e a frente de Edge ficaram comigo;
> os testes e o storytelling ficaram com **Michel Tatsuya Hanada, RM 571987**.
> Obrigado.”

## Checklist antes de publicar

- [ ] O vídeo tem até 7 minutos.
- [ ] A imagem e a voz estão audíveis e legíveis.
- [ ] Os nomes e RMs dos três integrantes aparecem ou são falados.
- [ ] Os cinco estados aparecem: normal, atenção, alerta, crítico e falha.
- [ ] O Serial Monitor mostra o JSON com `simulated: true`.
- [ ] O vídeo explica os componentes e os limiares.
- [ ] O vídeo mostra a troca manual da distância e a decisão automática.
- [ ] O vídeo cita o cidadão, o problema, o local e os ODS.
- [ ] O vídeo declara que é simulação e que não há validação física.
- [ ] O projeto no Wokwi está público e abre sem ajustes.
- [ ] O vídeo está público ou não listado no YouTube.
- [ ] Os dois links abrem em janela anônima.
- [ ] A submissão no Teams tem apenas os dois links e os nomes/RMs.

## O que não dizer

- “O sensor está calibrado.”
- “O dispositivo está instalado na rua.”
- “O sistema avisa a Defesa Civil.”
- “O PLUVSTATS prevê enchentes.”
- “Testamos em campo.”
- “Funciona em qualquer cidade.”
- “O hardware foi validado.”

## Se precisar de uma versão mais curta

Mantenha a abertura, o problema, o circuito, os cinco estados e os limites. Corte
a explicação detalhada do código e a leitura do JSON. O essencial da disciplina é
mostrar o circuito, a decisão local, os estados e os limites com honestidade.
