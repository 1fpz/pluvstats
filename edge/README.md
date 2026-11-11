# Edge — PLUVSTATS

Nó de campo ESP32 com sensor ultrassônico HC-SR04, quatro LEDs e buzzer. O firmware
classifica o estado localmente com os mesmos limiares experimentais do restante da
plataforma e imprime telemetria JSON na porta serial.

> **Estado de validação:** firmware e diagrama preparados, mas **não executados em
> hardware físico nem no Wokwi** neste ambiente. Nenhum dispositivo real foi calibrado,
> instalado ou testado. O caminho de rede é opcional e também não foi validado contra
> um ESP32 real. Nada aqui comprova conectividade física.

## Estrutura

```text
edge/
├── esp32/pluvstats_sensor/
│   ├── pluvstats_sensor.ino     firmware Arduino/C++
│   ├── generated_config.h       limiares gerados a partir do JSON compartilhado
│   └── secrets.example.h        modelo de configuração de rede (não versionar secrets.h)
├── tools/
│   ├── sync_thresholds.py       gera/valida o header de limiares
│   └── test_sync_thresholds.py  testes do gerador
├── wokwi/
│   ├── diagram.json             ligações simuláveis
│   └── wokwi.toml               configuração da extensão Wokwi para VS Code
└── simulator/
    └── telemetry.example.json   contrato de payload (sem credenciais)
```

## Fiação

| ESP32 | Componente | Observação |
| --- | --- | --- |
| `D5` (GPIO5) | HC-SR04 `TRIG` | saída de disparo |
| `D18` (GPIO18) | HC-SR04 `ECHO` | **use divisor de tensão** (ex.: 1 kΩ / 2 kΩ); o HC-SR04 devolve 5 V e o ESP32 não é tolerante a 5 V |
| `VIN` (5 V) | HC-SR04 `VCC` | alimentação típica do módulo |
| `GND` | HC-SR04 `GND` | referência comum |
| `D25` (GPIO25) | LED verde + resistor 220 Ω | estado normal |
| `D26` (GPIO26) | LED amarelo + resistor 220 Ω | atenção |
| `D27` (GPIO27) | LED laranja + resistor 220 Ω | alerta |
| `D14` (GPIO14) | LED vermelho + resistor 220 Ω | crítico |
| `D12` (GPIO12) | buzzer ativo | assume buzzer ativo em nível alto; ajuste `kBuzzerActiveHigh` se o módulo for ativo em nível baixo |

O sensor é instalado no topo do canal, voltado para a água. A distância medida é a
distância até a superfície; a lâmina é derivada da geometria compartilhada.

## Regras embarcadas

- **Aquisição:** cinco pulsos por ciclo; descarta leituras fora de
  `invalidDistanceRangeCm`; usa a **mediana**; exige pelo menos três amostras válidas.
- **Nível:** `h = sensorHeightCm - distância`, limitado entre `0` e `channelDepthCm`.
  Com a geometria atual (120 cm de altura, 100 cm de profundidade), a distância de
  112 cm corresponde a 8 cm de lâmina.
- **Taxa:** inclinação entre a leitura mais recente e a amostra mais antiga dentro de
  uma janela de 10–60 s. Janelas menores que 10 s são rejeitadas para não extrapolar
  ruído. O valor é informativo e não substitui uma série calibrada.
- **Classificação:** faixas de `shared/pluvstats.config.json` para nível e taxa,
  com **histerese** idêntica à do backend (`app/intelligence/thresholds.py`). O estado
  local é o mais severo entre nível e taxa.
- **Falha:** três leituras inválidas consecutivas (ou timeout) marcam falha de sensor.
  O LED amarelo pisca e o buzzer emite um padrão de erro; o último estado conhecido
  não é promovido a leitura válida.

Saídas locais:

| Estado | LEDs | Buzzer |
| --- | --- | --- |
| normal | verde | silencioso |
| atenção | amarelo | bipe curto a cada 6 s |
| alerta | laranja | dois bipes a cada 3 s |
| crítico | vermelho | três bipes a cada 2 s |
| falha | amarelo piscando | padrão de erro a cada 3 s |

## Limiares sincronizados

O firmware não lê JSON em tempo de execução. O header `generated_config.h` é gerado a
partir da fonte única:

```bash
python edge/tools/sync_thresholds.py           # regrava o header
python edge/tools/sync_thresholds.py --check   # falha se houver divergência
python -m unittest discover -s edge/tools -p "test_*.py"
```

Sempre que `shared/pluvstats.config.json` mudar, regenere e versione o header junto.
Os testes do gerador verificam que o arquivo commitado corresponde ao JSON.

## Compilação

Requer o core ESP32 instalado no Arduino CLI (`esp32:esp32`). A compilação **não foi
executada** neste ambiente; os comandos são a preparação documentada.

```bash
arduino-cli compile --fqbn esp32:esp32:esp32 \
    --build-path build edge/esp32/pluvstats_sensor
arduino-cli upload -p COM5 --fqbn esp32:esp32:esp32 \
    --input-dir build edge/esp32/pluvstats_sensor
```

O monitor serial deve ser aberto em **115200 bauds**. A linha JSON é emitida a cada
5 s ou quando o estado muda.

## Contrato serial

```json
{
  "deviceId": "PLUV-ESP32-0001",
  "firmwareVersion": "0.1.0",
  "uptimeMs": 65000,
  "valid": true,
  "fault": false,
  "distanceCm": 70.0,
  "waterLevelCm": 50.0,
  "rateCmPerMin": 1.8,
  "severity": "alert",
  "simulated": false
}
```

`simulated: false` identifica a origem física do firmware. O backend só considera a
leitura válida se ela também for recente e estiver dentro da faixa aceita.

## Upload HTTP (opcional, não validado)

O caminho de rede é compilado apenas com `PLUVSTATS_ENABLE_NETWORK=1` e depende de
`secrets.h` (copie de `secrets.example.h`; nunca versione o arquivo real). O firmware
envia a cada 10 s:

```http
POST /api/hardware/readings
Content-Type: application/json
X-Device-Key: <chave local>

{"deviceId":"PLUV-ESP32-0001","distanceCm":70.0,"firmwareVersion":"0.1.0"}
```

No backend, a rota precisa estar habilitada (`PLUVSTATS_HARDWARE_ENABLED=true`) e a
chave precisa coincidir com `PLUVSTATS_HARDWARE_KEY`. O `deviceId` precisa existir como
sensor de hardware (`PS-05` no seed).

Enviar um payload de teste pela rede demonstra apenas que o **contrato HTTP** funciona.
Não comprova que existe um dispositivo físico, que o sensor está calibrado ou que a
leitura representa uma via real. Para testes de contrato, use um banco descartável e
registre explicitamente que a origem é sintética.

Uma amostra do payload está em `simulator/telemetry.example.json`.

## Wokwi

O projeto usa a extensão Wokwi para VS Code:

1. compile o firmware com o comando acima;
2. abra `edge/wokwi/diagram.json`;
3. inicie a simulação;
4. ajuste a distância no HC-SR04 e observe LEDs, buzzer e monitor serial.

`diagram.json` e `wokwi.toml` foram escritos para essa montagem, mas **a simulação não
foi executada** neste ambiente. Não trate uma execução futura no Wokwi como validação
física: o Wokwi simula o sensor e não reproduz calibração, ruído, splashes, obstrução
ou falhas de alimentação.

## Limitações e segurança

- HC-SR04 é um sensor de distância de baixo custo, não um medidor de nível calibrado.
  Superfícies agitadas, espuma, detritos e incidência solar afetam a leitura.
- A geometria é fixa no JSON compartilhado; instalações diferentes exigem recalibração
  e novos testes.
- O modelo de taxa usa uma janela curta e não faz previsão hidrológica.
- O buzzer local é um alerta sonoro de protótipo, não um sistema de evacuação.
- Não há watchdog, proteção elétrica, invólucro IP ou redundância de alimentação.
- Nenhuma leitura deste módulo deve ser apresentada como dado oficial da Prefeitura de
  Santo André.

## Próximos passos de validação

1. Compilar com a versão real do core ESP32 e registrar o resultado.
2. Executar o diagrama no Wokwi e anexar captura/telemetria ao relatório.
3. Montar um banco de testes com distâncias conhecidas e comparar a mediana com uma
   régua; documentar erro e repetibilidade.
4. Testar o upload em rede local com o backend em banco descartável.
5. Só então avaliar instalação em campo, com autorização e supervisão adequadas.
