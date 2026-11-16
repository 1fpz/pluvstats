# Rodar o PLUVSTATS em outro PC

Este documento existe para uma coisa só: pegar o projeto em uma máquina limpa,
**sem depender da máquina antiga**, e chegar ao mesmo estado de trabalho —
frontend abrindo, API respondendo, testes passando, PDFs reproduzíveis e ZIPs
prontos para submissão.

Ele também diz, sem rodeio, o que **não** vem do GitHub e precisa ser refeito ou
recuperado (deploy, Wokwi, vídeos, entrevistas).

> Prazo da GS: **19/11/2026, 23h55**. O plano de entrega e de vitória está em
> [`PLANO-DE-ENTREGA.md`](PLANO-DE-ENTREGA.md). O checklist por disciplina está
> em [`deliverables/checklist.md`](deliverables/checklist.md).

---

## 1. O que vem e o que não vem

### Vem do repositório

| Item | Onde |
| --- | --- |
| Código do frontend, backend, edge, matemática e aplicação Python | `frontend/`, `backend/`, `edge/`, `mathematics/`, `python-app/` |
| Configuração única de limiares | `shared/pluvstats.config.json` |
| Testes automatizados (105) | junto de cada módulo |
| PDFs já gerados | `design/presentation/`, `pitch/`, `mathematics/report/` |
| Decks editáveis em HTML | `design/presentation/apresentacao.html`, `pitch/apresentacao-pitch.html` |
| Documentação, plano, checklists e roteiros | `*.md`, `documentation/`, `deliverables/` |
| Firmware e projeto do Wokwi | `edge/esp32/`, `edge/wokwi/` |
| Histórico Git (mais de 15 commits) | `.git/` |

### Não vem do repositório

| Item | Por quê | Como resolver |
| --- | --- | --- |
| `node_modules/` | dependências instaladas, não versionadas | `npm ci` em `frontend/` |
| `backend/.venv/` | ambiente Python local | criar a venv de novo (seção 5) |
| `backend/.env`, `frontend/.env` | configuração local, fora do Git | copiar dos arquivos `.env.example` |
| `backend/data/*.db` | banco SQLite gerado em execução | a API recria ao subir |
| `deliverables/zips/` | artefatos de entrega, ignorados pelo Git | rodar `build_zips.ps1` (seção 8) |
| `edge/esp32/pluvstats_sensor/secrets.h` | credencial de Wi-Fi, nunca versionada | criar só se for testar rede de verdade |
| URL da Vercel | deploy ainda não publicado | publicar (seção 9.3) |
| Link do Wokwi e vídeo de Edge | dependem de execução/gravação | refazer e preencher `edge/ENTREGA.md` |
| Vídeo de 3 min do Pitch e link do YouTube | dependem de gravação | refazer e preencher `pitch/email-investidor.md` |
| Entrevistas reais | ainda não realizadas | seguir `design/research/interview-kit.md` |

### Regra de ouro: clone, não baixe o ZIP

Baixar “Download ZIP” do GitHub entrega uma cópia **sem histórico Git**. Isso
quebra a exigência de commits do enunciado, impede `git pull`/`git push` e faz a
outra máquina virar um projeto paralelo. Use `git clone` (seção 3).

---

## 2. Pré-requisitos

| Ferramenta | Versão | Obrigatória? | Para quê |
| --- | --- | --- | --- |
| Git | 2.40+ | sim | clonar, commitar e sincronizar |
| Node.js | 20+ (com `npm`) | sim | frontend, testes e build |
| Python | 3.11+ | sim | backend, matemática, app Python e ferramentas do edge |
| Microsoft Edge ou Google Chrome | atual | não | regenerar os PDFs dos decks |
| PowerShell | 5.1+ (Windows) | não | scripts `scripts/` e `build_zips.ps1` |
| `pypdf` | qualquer | não | conferir a contagem de páginas dos PDFs |
| Vercel CLI / GitHub CLI | atual | não | deploy e publicação de releases |

Não é necessário conta, chave de API, credencial de nuvem ou acesso à Prefeitura.
A demonstração roda inteira com dados simulados identificados.

### Conferir o que já está instalado

```powershell
git --version
node --version
npm --version
python --version
```

No Windows, se `python` não responder, tente `py --version` e use `py` no lugar
de `python`. No Linux/macOS, use `python3`.

---

## 3. Clonar o projeto

```powershell
# escolha uma pasta de trabalho
cd $HOME\Desktop
git clone https://github.com/1fpz/pluvstats.git
cd pluvstats
```

Confira que o histórico veio junto:

```powershell
git log --oneline -5
git status
git remote -v
```

Esperado: pelo menos 15 commits, árvore limpa e `origin` apontando para
`https://github.com/1fpz/pluvstats.git`.

> O repositório está **público**. O enunciado de Front-end/Web pede repositório
> privado com acesso de escrita; se for exigido, torne-o privado e adicione os
> professores como colaboradores antes de submeter.

---

## 4. Caminho rápido: só o frontend (5 minutos)

É o suficiente para apresentar a demonstração, porque o frontend tem fallback
local com CRUD em `localStorage` quando não há API.

```powershell
cd frontend
npm ci
npm run dev
```

Abra <http://127.0.0.1:5173>.

- `npm ci` instala exatamente o que está em `package-lock.json`. Se o lockfile
  estiver em conflito, use `npm install`.
- O painel abre em modo demonstração, com selos de origem e dados simulados.
- A área do cidadão fica em `/cidadao`.
- **Configurações → Reiniciar dados** volta ao estado inicial.

Para validar o build de produção:

```powershell
npm run build
npm run preview
```

---

## 5. Caminho completo: frontend + API

Use **dois terminais**. O backend roda em `127.0.0.1:8000` e o frontend em
`127.0.0.1:5173`.

### 5.1 Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000
```

Em Linux/macOS:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000
```

Verifique:

- <http://127.0.0.1:8000/docs> — documentação interativa da API;
- <http://127.0.0.1:8000/api/health> — deve responder com status `ok`.

O banco é criado em `backend/data/pluvstats.db` na primeira execução. Ele **não**
vem do Git e pode ser apagado para voltar ao estado inicial.

> A ingestão de hardware vem desligada (`PLUVSTATS_HARDWARE_ENABLED=false`). Não
> ligue isso para a demonstração: sem hardware validado, o modo correto é o
> simulador.

### 5.2 Frontend apontando para a API

Em outro terminal:

```powershell
cd frontend
Copy-Item .env.example .env
```

Edite `frontend/.env` e confirme o valor (o exemplo já vem assim):

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Depois:

```powershell
npm ci
npm run dev
```

Se a API cair, o frontend volta sozinho ao runtime local e mostra o fallback em
**Diagnóstico**. Isso é comportamento esperado, não erro de instalação.

### 5.3 Atalho no Windows

Os scripts fazem os passos acima, incluindo venv, `.env` e instalação:

```powershell
# API + frontend em duas janelas
powershell -ExecutionPolicy Bypass -File scripts/start-full.ps1

# apenas a demonstração local, sem backend
powershell -ExecutionPolicy Bypass -File scripts/start-demo.ps1
```

Portas diferentes:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-full.ps1 -ApiPort 8001 -FrontendPort 5174
```

Nesse caso, ajuste `VITE_API_BASE_URL` e `PLUVSTATS_CORS_ORIGINS` para as novas
portas.

---

## 6. Rodar os testes (105)

Na raiz do repositório:

```powershell
# frontend: 23 testes, lint e build
cd frontend
npm ci
npm run test
npm run lint
npm run build
cd ..

# backend: 31 testes
cd backend
.\.venv\Scripts\python.exe -m pytest
cd ..

# matemática: 35 testes
python -m unittest discover -s mathematics/tests -p "test_*.py"

# aplicação Python: 12 testes
python -m unittest discover -s python-app/tests -p "test_*.py"

# ferramentas do edge: 4 testes
python -m unittest discover -s edge/tools -p "test_*.py"

# limiares sincronizados entre JSON e firmware
python edge/tools/sync_thresholds.py --check
```

Resultado esperado: **23 + 31 + 35 + 12 + 4 = 105 testes aprovados**, lint sem
erros e build concluído.

Dois avisos que já custaram tempo:

1. No PowerShell, `unittest` pode imprimir o resultado em stderr e o terminal
   exibir `Exited with code 1` mesmo com `OK`. Confira `$LASTEXITCODE`; ele deve
   ser `0`.
2. O console pode mostrar acentos quebrados (mojibake). Os arquivos estão em
   UTF-8; isso é só a página de código do terminal.

O firmware ESP32 **não** é compilado nessa verificação e o Wokwi **não** é
executado. Essas ausências estão registradas em [`edge/README.md`](edge/README.md)
e em [`documentation/testing/README.md`](documentation/testing/README.md).

---

## 7. Regenerar os PDFs

Os PDFs já estão versionados. Só regenere se editar o HTML ou o relatório.

### 7.1 Relatório de matemática (8 páginas)

```powershell
python mathematics/report/build_report.py
```

O script escreve o HTML sempre e usa o Microsoft Edge em modo headless para o
PDF. Para gerar apenas o HTML:

```powershell
python mathematics/report/build_report.py --html-only
```

### 7.2 Deck de Experience (18 páginas)

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (!(Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
& $edge --headless --disable-gpu --no-first-run `
  --print-to-pdf="design/presentation/apresentacao.pdf" `
  --print-to-pdf-no-header `
  "file:///$((Resolve-Path design/presentation/apresentacao.html).Path -replace '\\','/')"
```

### 7.3 Deck de Pitch (10 páginas)

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (!(Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
& $edge --headless --disable-gpu --no-first-run `
  --print-to-pdf="pitch/apresentacao-pitch.pdf" `
  --print-to-pdf-no-header `
  "file:///$((Resolve-Path pitch/apresentacao-pitch.html).Path -replace '\\','/')"
```

Conferir a contagem de páginas (opcional, requer `pip install pypdf`):

```powershell
python -c "from pypdf import PdfReader; print(len(PdfReader(r'design/presentation/apresentacao.pdf').pages))"
python -c "from pypdf import PdfReader; print(len(PdfReader(r'pitch/apresentacao-pitch.pdf').pages))"
python -c "from pypdf import PdfReader; print(len(PdfReader(r'mathematics/report/relatorio-tecnico.pdf').pages))"
```

Esperado: `18`, `10` e `8`. Se o número mudar, algum slide quebrou.

---

## 8. Gerar os ZIPs de entrega

O script é **Windows + PowerShell** e usa `robocopy`:

```powershell
powershell -ExecutionPolicy Bypass -File deliverables/build_zips.ps1
```

Saída em `deliverables/zips/`:

| Arquivo | Conteúdo |
| --- | --- |
| `pluvstats-python.zip` | `app.py`, `prompt.md`, `readme.md`, `tests/`, `data/` |
| `pluvstats-projeto.zip` | projeto completo, sem `node_modules`, `.venv`, caches, builds, banco, `.git` e os próprios ZIPs |

Os ZIPs **não são versionados**. Os que existem hoje foram gerados em 12/11 e
estão desatualizados em relação aos últimos commits: **regere antes de submeter**.

Em Linux/macOS, use `zip` manualmente com as mesmas exclusões, ou gere em uma
máquina Windows.

---

## 9. Partes opcionais

### 9.1 Aplicação Python

Só usa biblioteca padrão:

```powershell
cd python-app
python app.py
```

Para o relatório consolidado, sem menu:

```powershell
python app.py --report
```

O estado fica em `python-app/data/estado.json`, que não é versionado.

### 9.2 Edge e Wokwi

- Firmware: `edge/esp32/pluvstats_sensor/pluvstats_sensor.ino`
- Projeto do Wokwi: `edge/wokwi/`
- Checklist, roteiro do vídeo e links: [`edge/ENTREGA.md`](edge/ENTREGA.md)

O Wokwi roda no navegador, sem instalar toolchain. Para testar rede de verdade
seria necessário criar `secrets.h` com Wi-Fi e habilitar a ingestão no backend —
**isso não foi validado** e não é exigido pela rubrica de Edge.

### 9.3 Deploy do frontend

O passo a passo completo está em [`documentation/deploy.md`](documentation/deploy.md).
Resumo: importar o repositório na Vercel, definir **Root Directory** = `frontend`,
Build Command = `npm run build`, Output Directory = `dist`, permitir arquivos
fora da raiz (o frontend lê `shared/pluvstats.config.json`) e, se houver API
publicada, definir `VITE_API_BASE_URL`. Sem backend, o fallback local funciona.

A URL pública ainda **não existe**; depois de publicar, adicione-a ao `README.md`
e ao checklist.

---

## 10. O que não dá para recuperar só com o Git

Se a outra máquina for a única disponível, estes itens precisam ser refeitos ou
recuperados fora do repositório:

| Item | Onde procurar/refazer |
| --- | --- |
| Conta e projeto do Wokwi | login no Wokwi; se não houver, recriar o projeto e publicar |
| Vídeo de Edge | gravar de novo seguindo `edge/ENTREGA.md` |
| Vídeo de Pitch | gravar de novo seguindo `pitch/roteiro-video.md` |
| Link do YouTube | publicar como público ou não listado e copiar para o e-mail |
| Deploy da Vercel | refazer pela dashboard; a URL antiga pode ser recriada |
| Entrevistas | seguir `design/research/interview-kit.md`; nenhuma fala foi inventada |
| E-mails da equipe no checklist | preencher em `deliverables/checklist.md` |
| Favoritos e histórico do navegador | exportar da máquina antiga, se ainda houver acesso |

Nada disso está no Git de propósito: credencial, vídeo e link de serviço externo
não devem ser versionados.

---

## 11. Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| `git` não é reconhecido | Git não instalado ou fora do PATH | instalar Git e reabrir o terminal |
| `npm` não é reconhecido | Node não instalado ou PATH antigo | instalar Node 20+ e reabrir o terminal |
| `python` abre a Microsoft Store | alias do Windows | usar `py` ou instalar o Python oficial e marcar “Add to PATH” |
| `npm ci` falha | lockfile ausente ou em conflito | rodar `npm install` uma vez |
| Porta 5173 ou 8000 ocupada | outra instância rodando | fechar a janela antiga ou usar `--port` |
| Frontend mostra fallback | API não configurada ou fora do ar | conferir `VITE_API_BASE_URL` e reiniciar o Vite |
| Erro de CORS | origem diferente da configurada | ajustar `PLUVSTATS_CORS_ORIGINS` no `backend/.env` |
| `build_report.py` não gera PDF | Edge não encontrado | gerar com `--html-only` ou instalar Edge/Chrome |
| PDF com página a mais/menos | slide quebrou no HTML | corrigir o HTML e regerar |
| `build_zips.ps1` falha | `robocopy` indisponível (Linux/macOS) | gerar os ZIPs em Windows |
| `Exited with code 1` nos testes Python | stderr do `unittest` no PowerShell | conferir `$LASTEXITCODE`; se `0`, está tudo certo |
| Acentos quebrados no console | página de código do terminal | os arquivos estão em UTF-8; ignorar o efeito visual |

---

## 12. Checklist de máquina nova

- [ ] `git clone` feito (não download de ZIP) e `git log` mostra o histórico.
- [ ] `git status` limpo.
- [ ] `npm ci` concluído em `frontend/`.
- [ ] `npm run dev` abre a demonstração em `http://127.0.0.1:5173`.
- [ ] Venv do backend criada e `pip install -r requirements.txt` concluído.
- [ ] `backend/.env` e `frontend/.env` criados a partir dos `.env.example`.
- [ ] API responde em `http://127.0.0.1:8000/docs`.
- [ ] Frontend em modo API (sem aviso de fallback no **Diagnóstico**).
- [ ] 105 testes aprovados, lint e build sem erro.
- [ ] `python edge/tools/sync_thresholds.py --check` passa.
- [ ] PDFs abrem e têm 18, 10 e 8 páginas.
- [ ] ZIPs regerados em `deliverables/zips/`.
- [ ] Pendências humanas revisadas em `deliverables/checklist.md`.

---

## 13. Por onde continuar

1. [`PLANO-DE-ENTREGA.md`](PLANO-DE-ENTREGA.md) — o que falta, prazos, playbooks,
   riscos e critérios de vitória.
2. [`deliverables/checklist.md`](deliverables/checklist.md) — item a item por
   disciplina.
3. [`edge/ENTREGA.md`](edge/ENTREGA.md) — Wokwi, vídeo e links.
4. [`documentation/deploy.md`](documentation/deploy.md) — Vercel e limitações.
5. [`deliverables/demo-90s.md`](deliverables/demo-90s.md) — demonstração
   cronometrada e plano B.
6. [`design/research/interview-kit.md`](design/research/interview-kit.md) — as
   três conversas que ainda faltam.

Se algo deste documento não bater com a máquina nova, corrija o documento no
mesmo commit da correção. Setup que não é testado vira lenda.
