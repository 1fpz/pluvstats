# Entrega de Edge — PLUVSTATS

Checklist e roteiro da disciplina **Edge Computing & Computer Systems**
(Global Solution 2026.2 · CitizenTech). O enunciado pede apenas dois links:
o projeto público no Wokwi e o vídeo no YouTube. Os nomes de todos os
integrantes devem constar no código-fonte — o cabeçalho de
`esp32/pluvstats_sensor/pluvstats_sensor.ino` já traz os três.

## Equipe no código-fonte

A frente de **Edge Computing & Computer Systems** foi conduzida por
**Marcos Vinícius Tudisco (RM 569366)**, com revisão geral de Felipe Ilek.

| Integrante | RM | Participação |
| --- | --- | --- |
| Felipe Ilek | 571322 | Autor e desenvolvedor do projeto |
| Marcos Vinícius Tudisco | 569366 | Integração e Edge Computing & Computer Systems |
| Michel Tatsuya Hanada | 571987 | Testes e Storytelling & Inspiração Empreendedora |

## Links da entrega

| Item | Link | Estado |
| --- | --- | --- |
| Projeto no Wokwi (público, abre e roda sem ajustes) | `[LINK DO PROJETO WOKWI — SUBSTITUIR]` | **pendente** |
| Vídeo no YouTube (público ou não listado, até 7 min) | `[LINK DO VÍDEO NO YOUTUBE — SUBSTITUIR]` | **pendente** |

> A simulação foi executada e ajustada pela equipe no Wokwi. Os links acima são
> marcadores e precisam ser preenchidos depois de publicar o projeto e gravar o
> vídeo. Não entregue um link privado, um projeto que exige ajustes ou um vídeo
> sem imagem e voz da equipe.

## O que já está pronto

- firmware comentado em `esp32/pluvstats_sensor/pluvstats_sensor.ino`;
- header de limiares gerado a partir de `shared/pluvstats.config.json`;
- quatro estados + falha, com histerese e respostas distintas;
- mediana de cinco amostras, rejeição de leitura inválida e proteção de
  plausibilidade contra saltos manuais;
- diagrama e configuração do Wokwi em `wokwi/`;
- simulação executada no Wokwi, com os cinco estados e troca manual de distância;
- 4 testes do gerador de limiares (`python -m unittest discover -s edge/tools -p "test_*.py"`);
- contrato de telemetria em `simulator/telemetry.example.json`.

## O que falta executar

1. **Publicar** o projeto no Wokwi como público e copiar o link.
2. **Gravar o vídeo** de até 7 minutos, com imagem e voz.
3. **Publicar** o vídeo como público ou não listado no YouTube.
4. **Preencher os dois links** neste arquivo e no Teams.

## Roteiro do vídeo (até 7 minutos)

Versão detalhada, com falas e marcações de tempo para o Marcos gravar:
[`roteiro-video-marcos.md`](roteiro-video-marcos.md).

| Tempo | Bloco | Conteúdo |
| --- | --- | --- |
| 0:00–0:50 | Ideia | cidadão, problema em uma frase, onde o dispositivo fica e ODS 6, 11 e 13 |
| 0:50–2:00 | Circuito | ESP32, HC-SR04, ECHO direto no Wokwi (divisor no hardware real), quatro LEDs, buzzer e alimentação |
| 2:00–3:30 | Lógica | limiares, histerese, mediana de cinco amostras, rejeição de leitura inválida e estados |
| 3:30–5:30 | Simulação comentada | alterar a distância no Wokwi e mostrar normal, atenção, alerta, crítico e falha |
| 5:30–6:30 | Código | trecho da classificação, uso de `millis()` e saída no Serial Monitor |
| 6:30–7:00 | Limites | protótipo não validado fisicamente, não é alerta oficial e não aciona equipes |

### Falas de abertura sugeridas

> “Este é o PLUVSTATS: um nó de borda que mede a distância até a água, decide
> localmente e reage mesmo sem internet. Ele fica no topo de um canal e não
> substitui a Defesa Civil.”

### Demonstração no Wokwi

Altere a distância do HC-SR04 e mostre, nesta ordem:

| Distância aproximada | Nível calculado | Estado esperado | Resposta |
| --- | --- | --- | --- |
| 112 cm | 8 cm | normal | LED verde, sem som |
| 90 cm | 30 cm | atenção | LED amarelo, bipe curto a cada 6 s |
| 60 cm | 60 cm | alerta | LED laranja, dois bipes a cada 3 s |
| 25 cm | 95 cm | crítico | LED vermelho, três bipes a cada 2 s |
| 400 cm (fora da faixa) | — | falha após 3 ciclos | LED amarelo piscando e padrão de erro |

> A troca de distância é manual. Quando o salto passa de 30 cm/min, o firmware
> mostra `[guard] implausible slope ... ignored; rate restarted`, descarta a janela
> de taxa e classifica pelo nível. Não é preciso reiniciar a simulação.
>
> A geometria adotada é `H = 120 cm` e profundidade de `100 cm`. O valor de
> distância é uma entrada simulada; não há calibração real.

## Checklist de qualidade

- [x] O diagrama abre no Wokwi sem ajustes manuais.
- [x] Os fios estão organizados, sem cruzamentos desnecessários.
- [x] O código está comentado e com os nomes/RMs no cabeçalho.
- [x] Os cinco estados aparecem na simulação.
- [ ] O Serial Monitor mostra a telemetria JSON.
- [ ] O vídeo tem até 7 minutos e mostra imagem e voz.
- [ ] O vídeo cita o cidadão, o problema, o local e os ODS.
- [ ] O vídeo explica cada componente e por que ele está ali.
- [ ] O vídeo mostra o trecho do código da classificação.
- [ ] O link do Wokwi abre em janela anônima.
- [ ] O link do YouTube abre em janela anônima.
- [ ] A entrega no Teams contém apenas os dois links e os nomes/RM.

## ODS conectados

| ODS | Conexão no dispositivo |
| --- | --- |
| **ODS 6** | mede nível de água em um ponto de drenagem demonstrativo |
| **ODS 11** | reage localmente em área urbana sujeita a alagamento |
| **ODS 13** | apoia preparação local para chuvas intensas, com limites explícitos |

A conexão é potencial e não medida. O dispositivo não prevê enchentes.

## Limites que precisam aparecer no vídeo

- nenhum hardware físico foi montado ou validado;
- o Wokwi simula o sensor e não reproduz calibração, ruído, respingos ou falha de alimentação;
- o buzzer é um alerta de protótipo, não um sistema de evacuação;
- não há watchdog, proteção elétrica, invólucro IP ou redundância;
- nenhuma leitura deve ser apresentada como dado oficial da Prefeitura.

## Comandos úteis

```bash
# testes do gerador de limiares
python -m unittest discover -s edge/tools -p "test_*.py"

# conferir se o header está sincronizado com o JSON compartilhado
python edge/tools/sync_thresholds.py --check

# regravar o header depois de mudar o JSON
python edge/tools/sync_thresholds.py

# compilar (requer o core ESP32 instalado)
arduino-cli compile --fqbn esp32:esp32:esp32 --build-path build edge/esp32/pluvstats_sensor
```

Detalhes de fiação, contrato serial e limitações em [`README.md`](README.md).
