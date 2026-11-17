# Deploy — PLUVSTATS

Guia de publicação do frontend na **Vercel** e observações sobre o backend.

**Ambiente publicado:** <https://pluvstats.vercel.app/>

O deploy roda apenas o frontend em modo demonstração. Sem `VITE_API_BASE_URL`, o
app usa o repositório local de dados simulados e informa o fallback no
Diagnóstico.

## O que será publicado

| Item | Valor |
| --- | --- |
| Projeto | `pluvstats-frontend` |
| Diretório raiz na Vercel | `frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Variável obrigatória | nenhuma |
| Variável opcional | `VITE_API_BASE_URL` |

O arquivo [`frontend/vercel.json`](../frontend/vercel.json) já define framework,
build, output, rewrites de SPA e cabeçalhos básicos de segurança.

## Passo a passo

1. Crie uma conta em <https://vercel.com> e conecte o GitHub.
2. Clique em **Add New → Project** e importe `1fpz/pluvstats`.
3. Em **Root Directory**, selecione `frontend`.
4. Confirme **Framework Preset = Vite**.
5. Build Command = `npm run build`; Output Directory = `dist`.
6. Se o build reclamar que `shared/pluvstats.config.json` não existe, abra
   **Settings → General → Include source files outside of the Root Directory in
   the Build Step** e ative. O frontend importa a configuração compartilhada do
   repositório; ela é a fonte única de limiares.
7. Deixe `VITE_API_BASE_URL` vazia para publicar apenas a demonstração.
8. Clique em **Deploy** e aguarde o build.
9. Abra a URL gerada e percorra o roteiro de fumaça abaixo.
10. Copie a URL para o README, na seção **Deploy**.

### Com a API publicada

1. Publique o backend em um serviço que execute Python (Fly.io, Render, Railway
   ou equivalente) e exponha a porta HTTP.
2. Defina `VITE_API_BASE_URL=https://<seu-backend>` nas variáveis de ambiente da
   Vercel e faça um novo deploy.
3. Libere CORS no backend para o domínio da Vercel.
4. Confirme no Diagnóstico que a origem mudou de “demonstração local” para “API”.
5. Se a API cair, o frontend volta ao modo local — teste esse fallback.

> O backend usa SQLite. Em serviços com disco efêmero, os dados podem ser
> perdidos a cada deploy. Para a entrega acadêmica, isso é aceitável desde que
> documentado; para produção, seria necessário um banco persistente.

## Verificação pós-deploy

1. Abra `/` e confirme o selo **Demonstração** no topo.
2. Abra `/mapa` e selecione um ponto.
3. Abra `/sensores` e confirme o dispositivo de hardware como **não validado**.
4. Abra `/configuracoes`, escolha o cenário **Crítico** e aguarde um ciclo.
5. Abra `/alertas` e reconheça um alerta.
6. Abra `/cidadao`, registre uma ocorrência e confirme o protocolo demonstrativo.
7. Abra `/diagnostico` e verifique a origem dos dados e o fallback.
8. Recarregue uma rota profunda, como `/cidadao/informacoes`, para testar o
   rewrite de SPA.

## Limitações

- Não há SLA, alta disponibilidade ou observabilidade de produção.
- Não há autenticação nem perfis de usuário.
- O backend publicado com SQLite pode perder dados em reinícios.
- A demonstração não substitui a API real; o selo de simulação continua visível.

## Rollback

Na Vercel, abra **Deployments**, selecione a implantação anterior e escolha
**Promote to Production**. O rollback não altera o repositório nem o banco.
