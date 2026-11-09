# Edge — PLUVSTATS

ESP32 + HC-SR04 + LEDs + buzzer. O firmware é independente da interface web e classifica
estados localmente com as mesmas faixas experimentais do restante da plataforma.

```text
edge/
├── esp32/       firmware Arduino/C++
├── wokwi/       diagram.json e instruções de simulação
└── simulator/   contrato de telemetria para testes sem hardware
```

> Nenhuma comunicação física foi testada até o momento. A documentação dirá explicitamente
> o que foi validado e o que permanece como preparação.
