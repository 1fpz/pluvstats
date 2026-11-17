# Entrevistas qualitativas — PLUVSTATS

Registro das três conversas que orientaram a definição do problema na disciplina
de **Software & Total Experience Design**. Santo André/SP, novembro de 2026.

## Método

- **Formato:** entrevista semiestruturada, 20 a 25 minutos, conduzida pela equipe.
- **Perfis:** um morador, um analista de mobilidade urbana e um motorista de
  aplicativo.
- **Objetivo:** entender como as pessoas descobrem, decidem e agem em dias de
  chuva forte — não confirmar a solução.
- **Anonimato:** nenhum nome, telefone, endereço exato ou dado pessoal é
  registrado. As falas são identificadas apenas pelo perfil.
- **Amostra:** três conversas qualitativas. Não é amostra representativa e não
  permite generalização estatística.

## Perfis

| Perfil | Contexto | O que faz na cidade |
| --- | --- | --- |
| Morador e trabalhador | Região central de Santo André | circula de carro e transporte público no trajeto diário |
| Analista de mobilidade urbana | Administração pública | acompanha ocorrências e prioriza vistorias em dias de chuva |
| Motorista de aplicativo | Circulação por várias regiões | transporte de passageiros, decisão de rota em tempo real |

## Falas

> “Muitas informações chegam atrasadas.”
> — Morador, região central

> “Precisaria saber se a água está aumentando ou diminuindo.”
> — Morador, região central

> “Precisamos entender quais situações exigem atenção primeiro.”
> — Analista de mobilidade

> “Dados antigos apresentados como atuais podem gerar problemas.”
> — Analista de mobilidade

> “Na maioria das vezes, só descubro quando chego perto.”
> — Motorista de aplicativo

> “A situação muda muito rápido quando chove.”
> — Motorista de aplicativo

## O que se repetiu

| Padrão | Como apareceu |
| --- | --- |
| **Informação tardia** | o alagamento é descoberto quando a pessoa já está perto do ponto |
| **Canais dispersos** | WhatsApp, notícias, GPS e contatos informais, sem uma referência comum |
| **Falta de contexto** | saber que existe água não informa intensidade nem evolução |
| **Confiança depende de origem e hora** | horário, fonte e atualização são o que faz a informação valer |
| **Priorização na gestão** | organizar solicitações e comparar histórico é o gargalo do analista |

## O que mudou no produto

1. **Horário e evolução visíveis.** O sistema passou a mostrar quando a leitura
   foi feita e se o nível sobe ou desce, em vez de apenas indicar ocorrência.
2. **Registro padronizado com histórico.** Cada ponto ganhou histórico para
   comparar recorrência e apoiar a priorização da gestão.
3. **Validade temporal explícita.** Alertas e leituras exibem idade do dado,
   porque a informação perde valor em minutos durante a chuva.

## Limites

- Três conversas não medem incidência, impacto, preferência ou disposição a usar
  o produto.
- Não houve teste de usabilidade, observação em campo ou validação com
  especialistas.
- O recorte é de Santo André e não representa outras cidades.
- As personas continuam sendo hipóteses de projeto; as conversas as
  aproximaram do contexto, não as validaram estatisticamente.

## Uso na entrega

O deck de Experience resume essas evidências no slide 5 (“O que ouvimos”), com a
ressalva de amostra pequena. O restante da documentação mantém a distinção entre
evidência qualitativa, premissa de projeto e hipótese de design.
