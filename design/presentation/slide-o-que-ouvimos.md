# Slide “O que ouvimos” — guia rápido

Como transformar **3 conversas reais** em um slide do deck de Experience, sem
inventar fala, sem expor ninguém e sem quebrar a numeração do PDF.

> Este guia só serve para conversas que **aconteceram de verdade**. Se não houver
> tempo, não adicione o slide: o deck já declara as personas como hipóteses e isso
> é honesto. Nunca preencha com fala fictícia.

## 1. Faça a conversa em 8 minutos

Três pessoas de perfis diferentes: um morador/pedestre, um gestor ou analista e
um técnico de campo. Se só der dois, faça dois de cidadão.

**Abertura e consentimento (1 min):**

> “Sou estudante da FIAP e estou fazendo um trabalho sobre alagamentos em Santo
> André. Não vim vender nada. Quero entender como você resolve isso hoje. Posso
> anotar? Posso usar sua fala de forma anônima no trabalho?”

Guarde a resposta (print, áudio ou termo de
[`../research/interview-kit.md`](../research/interview-kit.md)). Não anote nome
completo, telefone, CPF ou endereço.

**Três perguntas (6 min):**

1. “Como você se informa sobre chuva e alagamento hoje?”
2. “Na última chuva forte, o que você fez? Conte do começo ao fim.”
3. “O que faria você confiar — ou desconfiar — de um número sobre alagamento?”

**Fechamento (1 min):**

> “Se você pudesse pedir uma coisa só para melhorar essa situação, qual seria?”

## 2. Registre sem identificar

Uma ficha por conversa:

```text
Perfil: ( ) morador  ( ) gestor/analista  ( ) técnico de campo
Região (sem endereço):
Data e duração:
O que a pessoa faz hoje:
Dor principal:
O que gera confiança:
O que gera desconfiança:
Frase mais forte (anônima, autorizada):
O que mudou na minha visão sobre o produto:
O que eu não esperava ouvir:
```

## 3. Monte o conteúdo do slide

| Perfil | Fala anônima | O que mudou |
| --- | --- | --- |
| Morador do entorno | uma frase curta e literal | uma decisão concreta de produto ou prioridade |
| Gestor/analista | uma frase curta e literal | uma decisão concreta |
| Técnico de campo | uma frase curta e literal | uma decisão concreta |

Inclua também:

- **Confirmou:** o que a conversa reforçou.
- **Não confirmou:** o que a equipe esperava e não apareceu.
- **Limite:** “3 conversas exploratórias; não é pesquisa estatística nem
  validação de impacto.”

Se ninguém citou “tempo até o limite”, diga isso. O slide ganha mais com uma
contradição honesta do que com três falas que só elogiam o produto.

## 4. Bloco HTML pronto

O deck é `design/presentation/apresentacao.html`. O bloco abaixo usa as classes
que já existem no arquivo.

```html
<!-- 18 -->
<section class="slide">
  <div class="slide-head">
    <div>
      <div class="kicker">O que ouvimos</div>
      <h2>Três conversas, três ajustes de prioridade</h2>
    </div>
    <div class="index">18 / 19</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:22%">Perfil</th>
        <th style="width:44%">Fala anônima, com autorização</th>
        <th style="width:34%">O que mudou</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Morador do entorno</strong><br><span class="muted">Santo André · 8 min</span></td>
        <td>“[FALA REAL 1]”</td>
        <td>[DECISÃO 1: o que a equipe ajustou no produto ou na prioridade]</td>
      </tr>
      <tr>
        <td><strong>Gestor ou analista</strong><br><span class="muted">Santo André · 8 min</span></td>
        <td>“[FALA REAL 2]”</td>
        <td>[DECISÃO 2]</td>
      </tr>
      <tr>
        <td><strong>Técnico de campo</strong><br><span class="muted">Santo André · 8 min</span></td>
        <td>“[FALA REAL 3]”</td>
        <td>[DECISÃO 3]</td>
      </tr>
    </tbody>
  </table>

  <div class="grid-3" style="margin-top:18px">
    <div class="card"><h3>Confirmou</h3><p>[O que a conversa reforçou]</p></div>
    <div class="card"><h3>Não confirmou</h3><p>[O que a equipe esperava e não apareceu]</p></div>
    <div class="card"><h3>Limite</h3><p>3 conversas exploratórias; não é pesquisa estatística nem validação de impacto.</p></div>
  </div>

  <div class="footer"><span>PLUVSTATS · CitizenTech 2026.2</span><span>18 / 19</span></div>
</section>
```

## 5. Onde inserir

O caminho mais seguro é colocar o slide **antes do encerramento**, sem mexer nos
slides 1–17:

1. Abra `design/presentation/apresentacao.html`.
2. Localize o comentário `<!-- 18 -->` (é o slide de encerramento).
3. Cole o bloco acima **antes** desse comentário.
4. No slide de encerramento, troque:
   - `<!-- 18 -->` por `<!-- 19 -->`;
   - `18 / 18` por `19 / 19` no índice e no rodapé.
5. Confira que o arquivo tem 19 blocos `<section class="slide">`.

Se quiser manter 18 páginas, substitua o bloco do slide 16 (“Decisões e riscos”)
pelo novo slide e mantenha os índices em `16 / 18`. Você perde o conteúdo de
riscos; por isso o caminho de 19 páginas é melhor.

## 6. Regenere o PDF

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (!(Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
& $edge --headless --disable-gpu --no-first-run `
  --print-to-pdf="design/presentation/apresentacao.pdf" `
  --print-to-pdf-no-header `
  "file:///$((Resolve-Path design/presentation/apresentacao.html).Path -replace '\\','/')"
```

Confira a contagem:

```powershell
python -c "from pypdf import PdfReader; print(len(PdfReader(r'design/presentation/apresentacao.pdf').pages))"
```

Esperado: `19`. Se continuar `18`, o bloco não foi inserido ou o PDF não foi
regravado.

## 7. Atualize o texto da entrega

Se o slide existir, use a versão B em
[`../../deliverables/SUBMISSOES.md`](../../deliverables/SUBMISSOES.md):

> “O slide ‘O que ouvimos’ registra 3 conversas exploratórias, sem generalização
> estatística.”

Se não existir, use a versão A. Nunca envie a versão B sem o slide.

## Checklist

- [ ] As 3 conversas aconteceram de verdade.
- [ ] Há autorização para uso anônimo.
- [ ] Nenhum nome, telefone, endereço ou foto identificável.
- [ ] Cada fala é literal e curta; interpretação fica na coluna “O que mudou”.
- [ ] O slide registra o que **não** se confirmou.
- [ ] A linha de limite aparece.
- [ ] O PDF tem 19 páginas.
- [ ] O texto da submissão corresponde ao que está no PDF.
