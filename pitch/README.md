# Pitch — PLUVSTATS

Roteiro de apresentação do protótipo acadêmico. Não contém métricas de mercado,
tração, entrevistas ou resultados de campo inventados.

## Narrativa em uma frase

PLUVSTATS organiza sinais de água urbana em uma experiência única para gestão e
cidadania — com origem, incerteza e limites visíveis em cada tela.

## Estrutura sugerida (10–12 slides)

1. **Título** — PLUVSTATS, inteligência territorial para águas urbanas.
2. **Problema** — informação fragmentada, pontos críticos e comunicação difícil.
3. **Proposta** — monitorar, priorizar e comunicar com proveniência explícita.
4. **Duas experiências** — painel de gestão e área do cidadão.
5. **Arquitetura** — frontend, API, edge, matemática e configuração única.
6. **Integridade** — demonstração x hardware, validação e fallback.
7. **Matemática** — nível, taxa e tempo até o limite, com limitações.
8. **Edge** — ESP32 preparado; nada validado fisicamente.
9. **Demonstração** — roteiro ao vivo.
10. **Evidências** — testes, build e verificação de integração.
11. **Limites e ética** — o que o produto não é.
12. **Próximos passos** — pesquisa, bancada e parceria.

## Versão de 5 minutos

| Tempo | Conteúdo |
| --- | --- |
| 0:00–0:40 | problema e proposta em uma frase |
| 0:40–1:30 | visão geral e mapa no painel |
| 1:30–2:20 | alerta simulado, sensores e proveniência |
| 2:20–3:00 | área do cidadão e registro |
| 3:00–3:40 | arquitetura e fonte única de limiares |
| 3:40–4:20 | matemática e edge, com ressalvas |
| 4:20–5:00 | evidências, limites e próximos passos |

## Roteiro de demonstração

Pré-requisitos:

- frontend em execução;
- backend opcional; se ausente, a demonstração local assume;
- nenhum hardware necessário.

Passos:

1. Abrir a **Visão geral**. Apontar o banner permanente e os contadores.
2. Ir ao **Mapa** e selecionar uma ocorrência. Mostrar origem e vínculo com
   sensor.
3. Em **Sensores**, mostrar um sensor simulado e o dispositivo `PS-05` de
   hardware **não validado**.
4. Em **Configurações**, escolher o cenário **Crítico** e aguardar um ciclo.
5. Em **Alertas**, abrir o alerta, ler métricas e reconhecê-lo.
6. Em **Intervenções**, criar uma vistoria vinculada à ocorrência.
7. Na **área do cidadão**, registrar um problema e mostrar o protocolo
   demonstrativo.
8. Em **Diagnóstico**, mostrar a origem dos dados, a ausência de hardware
   validado e o fallback quando a API não está disponível.
9. Em **Configurações**, restaurar a demonstração.

Frases que devem acompanhar a demo:

- “Este dado é simulado.”
- “Este dispositivo não foi validado fisicamente.”
- “O sistema não aciona equipes.”
- “Com a API fora do ar, a interface continua, mas informa o fallback.”

## Evidências para citar

- 20 testes de frontend, 31 de backend, 25 de matemática e 4 de sincronização de
  limiares.
- Lint e build sem erros; aviso de bundle de 1.179 kB.
- Integração verificada em navegador: ocorrência criada no SQLite e reset
  restaurando 9 ocorrências e 0 alertas.
- Fallback verificado com API configurada e indisponível.
- Nenhum teste físico ou de Wokwi executado.

Detalhes em [documentation/testing](../documentation/testing/README.md).

## FAQ

**O PLUVSTATS prevê enchentes?**
Não. Ele calcula nível, taxa e uma extrapolação linear. Não há modelo
hidrológico calibrado.

**Os dados são reais?**
Não. O ambiente padrão é demonstrativo e identifica os dados como simulados.

**Há integração com a Prefeitura ou Defesa Civil?**
Não. Nenhuma credencial, convênio ou canal oficial existe no projeto.

**O hardware funciona?**
O firmware e o diagrama estão preparados, mas não foram compilados nem testados
em bancada neste ambiente. Nenhum dispositivo físico foi validado.

**Por que não Supabase?**
Não há conexão configurada. A persistência atual é SQLite local. Supabase pode
ser avaliado depois, com credenciais e requisitos definidos.

**Como vocês garantem que simulação não vira hardware?**
O backend só aceita `deviceId` de hardware, valida faixa e idade da leitura e
nunca promove dados simulados. Testes cobrem os casos de rejeição.

**O que falta para uso real?**
Pesquisa com usuários, calibração de sensor, teste de campo, autenticação,
acessibilidade, observabilidade, deploy, acordos institucionais e validação
jurídica/ética.

**Qual é o diferencial?**
A combinação de experiência cidadã e gestão com proveniência explícita,
arquitetura modular e documentação dos limites — não uma promessa de previsão.

## O que não afirmar

- que o sistema salva vidas;
- que prevê alagamentos com precisão;
- que possui dados oficiais;
- que o hardware foi testado;
- que há usuários, entrevistas ou parceria institucional;
- que o modelo foi validado por especialistas.

## Próximos passos

1. Entrevistas e teste de usabilidade.
2. Compilação e execução do Wokwi.
3. Experimento de bancada com o HC-SR04.
4. Compartilhamento de séries com a banca.
5. Discussão de parceria e requisitos de produção.

O texto slide a slide está em [slides.md](slides.md).
