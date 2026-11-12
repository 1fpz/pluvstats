# Checklist de entrega — Global Solution 2026.2

Prazo oficial: **19/11/2026, às 23h55**. Entrega na plataforma Microsoft Teams,
uma submissão por equipe em cada disciplina. Este checklist separa o que já está
no repositório do que depende de ação humana (links, vídeos e deploy).

## Dados da equipe

| Integrante | RM | E-mail |
| --- | --- | --- |
| Felipe Ilek | 571322 | `[preencher]` |
| Michel Tatsuya Hanada | 571987 | `[preencher]` |
| Marcos Vinícius Tudisco | 569366 | `[preencher]` |

> Os e-mails não são inventados neste repositório. Preencha antes de submeter.

## 1. Computational Thinking with Python

- [x] Menu com as funcionalidades principais.
- [x] Validação de entradas.
- [x] `try/except` nos pontos de falha.
- [x] `if/elif/else` e `match/case`.
- [x] `while` e `for`.
- [x] Funções com parâmetros e retorno.
- [x] Listas, tuplas e dicionários.
- [x] Persistência em JSON.
- [x] `prompt.md` com uso de IA.
- [x] `readme.md` com descrição do projeto.
- [x] 12 testes aprovados.
- [ ] Gerar o ZIP `pluvstats-python.zip`.
- [ ] Submeter no Teams.

**Evidência:** [`python-app/`](../python-app/) · [`prompt.md`](../python-app/prompt.md) · [`readme.md`](../python-app/readme.md)

## 2. Differentiated Problem Solving

- [x] Código `.py` com o modelo.
- [x] Derivadas e taxas de variação.
- [x] Integrais para volume e exposição.
- [x] Limites de longo prazo.
- [x] Gráficos gerados a partir do código.
- [x] Relatório técnico em PDF com problema, modelo, análise e interpretação.
- [x] 35 testes aprovados.
- [ ] Conferir se o PDF final tem 8 páginas.
- [ ] Submeter `.py` + PDF no Portal.

**Evidência:** [`mathematics/`](../mathematics/) · [`relatorio-tecnico.pdf`](../mathematics/report/relatorio-tecnico.pdf)

## 3. Edge Computing & Computer Systems

- [x] Firmware comentado com nomes/RMs no cabeçalho.
- [x] Pelo menos 3 estados (normal, atenção, alerta, crítico e falha).
- [x] Respostas locais visíveis e audíveis.
- [x] Tratamento de leitura inválida e suavização por mediana.
- [x] Limiares justificados e sincronizados com o JSON.
- [x] Diagrama do Wokwi escrito.
- [x] Contrato de telemetria documentado.
- [ ] Compilar o firmware com o core ESP32.
- [ ] Executar o Wokwi e confirmar que abre sem ajustes.
- [ ] Publicar o projeto no Wokwi como público.
- [ ] Gravar vídeo de até 7 minutos com imagem e voz.
- [ ] Publicar o vídeo no YouTube (público ou não listado).
- [ ] Preencher os dois links em [`edge/ENTREGA.md`](../edge/ENTREGA.md).
- [ ] Submeter apenas os dois links no Teams.

**Evidência:** [`edge/`](../edge/) · [`ENTREGA.md`](../edge/ENTREGA.md)

## 4. Front-end Design

- [x] React com Vite.
- [x] Tailwind CSS.
- [x] Mais de 8 componentes reutilizáveis (36 componentes `.jsx`).
- [x] `useState` e `useEffect`.
- [x] Mais de 2 custom hooks (`useWeather`, `useMediaQuery`, `useDebouncedValue`).
- [x] Separação entre domínio, acesso a dados e apresentação.
- [x] CRUD de ocorrências via API.
- [x] Funcionalidades reais, não apenas interface estática.
- [x] 23 testes de frontend.
- [x] `AI.md` na raiz.
- [x] `README.md` com pré-requisitos e execução.
- [x] Repositório com mais de 15 commits.
- [ ] Fazer o deploy na Vercel.
- [ ] Copiar a URL para o README.
- [ ] Gerar o ZIP do projeto.
- [ ] Confirmar o acesso dos professores ao repositório (hoje público).
- [ ] Se a disciplina exigir repositório privado, torná-lo privado e conceder acesso de escrita.
- [ ] Submeter no Teams.

**Evidência:** [`frontend/`](../frontend/) · [`documentation/deploy.md`](../documentation/deploy.md)

## 5. Software & Total Experience Design

- [x] Capa com nomes/RMs.
- [x] Problema.
- [x] Escopo.
- [x] Requisitos, RNF e regras de negócio.
- [x] Caso de uso.
- [x] Protótipo, heurísticas e tom de voz.
- [x] Roadmap.
- [x] PDF com 18 páginas.
- [ ] Revisar o PDF final.
- [ ] Submeter no Teams.

**Evidência:** [`design/presentation/`](../design/presentation/)

## 6. Storytelling & Inspiração Empreendedora

- [x] E-mail simulado ao investidor.
- [x] Arquétipo de marca explicado.
- [x] Missão, visão e valores.
- [x] Nomes e RMs de todos os integrantes.
- [x] Roteiro de até 3 minutos com as nove etapas.
- [x] Deck de pitch em PDF.
- [ ] Gravar o vídeo com imagem e voz e slide deck.
- [ ] Publicar no YouTube (público ou não listado).
- [ ] Substituir o link no e-mail.
- [ ] Submeter documento + link no Teams.

**Evidência:** [`pitch/`](../pitch/)

## 7. Web Development

- [x] Mesma aplicação React/Vite/Tailwind do Front-end.
- [x] Componentização, hooks e custom hooks.
- [x] Separação de responsabilidades.
- [x] CRUD via API.
- [x] `AI.md` com ferramentas, prompts, aplicação, validação e análise crítica.
- [x] Repositório com mais de 15 commits.
- [ ] Deploy publicado e link no README.
- [ ] ZIP do projeto gerado.
- [ ] Submeter separadamente no Teams (mesmo app, professor diferente).

**Evidência:** [`AI.md`](../AI.md) · [`frontend/`](../frontend/) · [`backend/`](../backend/)

## Verificações finais (todas as disciplinas)

- [ ] `cd frontend && npm run test && npm run lint && npm run build`
- [ ] `cd backend && .\.venv\Scripts\python.exe -m pytest`
- [ ] `python -m unittest discover -s mathematics/tests -p "test_*.py"`
- [ ] `python -m unittest discover -s python-app/tests -p "test_*.py"`
- [ ] `python -m unittest discover -s edge/tools -p "test_*.py"`
- [ ] `python edge/tools/sync_thresholds.py --check`
- [ ] Gerar os PDFs: relatório de matemática, deck de Experience e deck de Pitch.
- [ ] Gerar os ZIPs com `deliverables/build_zips.ps1`.
- [ ] Abrir todos os PDFs e conferir a contagem de páginas.
- [ ] Abrir todos os links em janela anônima.
- [ ] Conferir se nenhum arquivo `.env`, banco ou segredo foi para o ZIP.
- [ ] Conferir nomes e RMs em README, decks, e-mail e firmware.
- [ ] Revisar o texto para não afirmar impacto, parceria ou validação inexistente.
- [ ] Submeter cada disciplina separadamente.
- [ ] Baixar os arquivos enviados e verificar a integridade.

## O que não pode ser afirmado na entrega

- que o sistema prevê enchentes;
- que há dados oficiais da Prefeitura ou Defesa Civil;
- que o hardware foi validado em campo;
- que o Wokwi foi executado, enquanto não for;
- que há usuários, entrevistas, tração ou parceria;
- que o deploy está no ar, enquanto não estiver;
- que o modelo foi calibrado ou validado por especialistas.
