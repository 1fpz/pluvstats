# Pitch — PLUVSTATS

Material de apresentação do protótipo acadêmico. Não contém métricas de mercado,
tração, entrevistas ou resultados de campo inventados.

A frente de **Storytelling & Inspiração Empreendedora** foi conduzida por
**Michel Tatsuya Hanada (RM 571987)**, com revisão geral de Felipe Ilek.

## Materiais

| Arquivo | Conteúdo |
| --- | --- |
| [`branding.md`](branding.md) | missão, visão, valores e arquétipo de marca |
| [`email-investidor.md`](email-investidor.md) | e-mail simulado ao investidor |
| [`apresentacao-pitch.html`](apresentacao-pitch.html) | deck editável de 10 slides |
| [`apresentacao-pitch.pdf`](apresentacao-pitch.pdf) | deck para entrega e apresentação |

## Narrativa em uma frase

PLUVSTATS organiza sinais de água urbana em uma experiência única para gestão e
cidadania — com origem, incerteza e limites visíveis em cada tela.

## Mensagem central

O problema não é falta de dado, é falta de contexto para decidir. O PLUVSTATS
aproxima leitura de sensor, ocorrência, alerta e intervenção em um mesmo ponto do
mapa, com proveniência explícita e uma área do cidadão sem jargão.

## Evidências para citar

- 23 testes de frontend, 31 de backend, 35 de matemática, 12 da aplicação Python
  e 4 de sincronização de limiares.
- Lint e build sem erros; entrada de ~300 kB e rotas carregadas sob demanda.
- Integração verificada em navegador: ocorrência criada no SQLite e reset
  restaurando 9 ocorrências e 0 alertas.
- Fallback verificado com API configurada e indisponível.
- Deploy público do frontend em <https://pluvstats.vercel.app/>.
- Simulação executada e publicada no Wokwi
  (<https://wokwi.com/projects/480625234214048769>); nenhum teste físico ou de
  bancada executado.

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
O firmware foi executado no Wokwi, mas não foi testado em bancada nem em um
dispositivo físico. Nenhum hardware real foi validado.

**Por que não Supabase?**
Não há conexão configurada. A persistência atual é SQLite local. Supabase pode
ser avaliado depois, com credenciais e requisitos definidos.

**Como vocês garantem que simulação não vira hardware?**
O backend só aceita `deviceId` de hardware, valida faixa e idade da leitura e
nunca promove dados simulados. Testes cobrem os casos de rejeição.

**O que seria necessário para uso real?**
Pesquisa com usuários, calibração de sensor, teste de campo, autenticação,
acessibilidade, observabilidade, deploy, acordos institucionais e validação
jurídica e ética.

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
