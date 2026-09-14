# Brain Agriculture — SPA frontend (teste Serasa Experian, track fullstack)

Data: 2026-09-14  
Status: aguardando revisão — código só depois do plano  
Fonte do desafio: [brain-ag/trabalhe-conosco](https://github.com/brain-ag/trabalhe-conosco)  
Complementa: `docs/superpowers/specs/2026-09-08-brain-agriculture-backend-design.md` (API já entregue)

SPA React que consome a API Nest existente. O desafio de front virou obrigatório: a vaga passou a fullstack. Gráficos de pizza saem do JSON do `GET /api/v1/dashboard`.

## Objetivo

Mostrar que o contrato da API dá para usar: cadastro, invariantes (422/409) na tela, dashboard com três pizzas. Sem segundo backend, sem Next, sem microfrontend.

Critério de pronto: Docker da API no ar, `cd web && npm run dev`, percorrer Dashboard → João → fazenda → plantio → 409 ao excluir produtor com fazenda, e `cd web && npm test` verde (MSW, sem Postgres).

## Fora de escopo

- Next.js, SSR, App Router, API routes
- Tailwind, MUI, Chakra, Axios
- Microfrontend (Module Federation / single-spa)
- Nginx servindo o SPA no Compose (ciclo posterior, se sobrar prazo)
- Auth, JWT, RBAC
- Cypress / Playwright
- AWS
- Tela só de editar plantio (create + delete)
- Transferência de fazenda, cadastro aninhado num POST, soft delete

## Stack

| Peça | Escolha |
|---|---|
| Bundler | Vite |
| UI | React + TypeScript |
| Estado / HTTP | Redux Toolkit + RTK Query (`fetchBaseQuery`) |
| Estilo | Styled Components + `ThemeProvider` |
| Gráficos | Recharts (três pizzas) |
| Rotas | React Router |
| Testes | Jest + Testing Library + MSW |
| Layout de componentes | Atomic design leve (atoms / molecules / organisms / pages) |
| Onde mora | pasta `web/` no **mesmo** repo; Nest continua na raiz (`src/`, `prisma/`) |

Não há pasta `serasa-front` / `serasa-back`. Duas pastas no mesmo Git seria monorepo válido; mover o Nest agora só quebra CI/Docker/README. Comunicação entre pastas **não** é import: é HTTP `/api/v1`.

## Arquitetura

O SPA é borda de UI. CPF, hectares e 409 continuam no domínio da Nest. O front envia JSON e mostra `problem+json.detail`.

```text
Browser (Vite :5173)
  pages + organisms
    → Redux (RTK Query)
         → /api/v1/...
              → proxy Vite (dev) e/ou CORS
                   → Nest :3000
                        → PostgreSQL
```

### Pastas

```text
web/src/
  components/atoms/       Button, Input, Select, ErrorText
  components/molecules/   FormField, StatCard
  components/organisms/   Header, ProducerForm, FarmForm, PlantingForm, PieCard
  pages/                  Dashboard, Producers, ProducerDetail, FarmDetail
  store/                  store.ts, api.ts (um createApi)
  styles/                 theme
```

Um `api.ts` cobre producers, farms, plantings e dashboard. Mutations invalidam tags para o dashboard não ficar stale.

Atomic visível o bastante para o avaliador abrir `atoms/Button`. Sem pasta por feature (`producers/`, `farms/`) neste tamanho.

## Dev: proxy + CORS

- Vite `server.proxy`: `/api` e `/health` → `http://localhost:3000`
- Nest: `enableCors({ origin: 'http://localhost:5173' })` em `configure-app.ts`
- Contrato, prefixo `/api/v1`, 409 e seed **não mudam**
- Compose neste ciclo: só API + Postgres (como hoje)

Demo: `docker compose up --build` e, em outro terminal, `cd web && npm run dev` → `http://localhost:5173`.

## Telas

Header: **Dashboard | Produtores**. Sem login. Português. Sem `alert()`.

| Rota | Conteúdo |
|---|---|
| `/` | Totais (`totalFarms`, `totalHectares`) + 3 pizzas |
| `/producers` | Lista paginada + formulário novo produtor |
| `/producers/:id` | Dados, PATCH nome, DELETE produtor, lista/cria fazendas |
| `/farms/:id` | Dados, DELETE fazenda (cascade plantios), lista/cria/apaga plantios |

### Dashboard

`GET /api/v1/dashboard`:

| Pizza | Série |
|---|---|
| Por estado | `farmsByState` (`state`, `count`) |
| Por cultura | `cropsPlanted` (`crop`, `count` = linhas de plantio) |
| Uso do solo | `landUse.arableHectares` vs `vegetationHectares` |

Texto no card de solo: a sobra `total − (arable + vegetation)` **não** entra na pizza (regra já documentada no back). Loading explícito. Vazio: “Nenhuma fazenda ainda”.

### Produtores

Tabela: nome, documento, tipo. `page` / `limit` iguais à API. Clique → detalhe. Form criar: 422 CPF e 409 duplicado no `ErrorText`.

### Detalhe do produtor

GET com `farms`. Form nova fazenda (nome, cidade, UF, três áreas) → 422 de soma no `ErrorText`. **Excluir produtor** sempre habilitado: DELETE; se 409, mostra o `detail` (`Não é possível excluir produtor com fazendas cadastradas`). Não desabilitar o botão para esconder a regra. PATCH de área da fazenda pode ser um bloco na mesma página; se apertar o prazo, create + delete de fazenda bastam.

### Detalhe da fazenda

Plantios com `harvestName` / `cropName`. Form safra + cultura; duplicata → 409. DELETE plantio na linha. DELETE fazenda → 204 e volta à lista/produtor.

### 404

“Não encontrado” + link para `/producers`.

### Fluxo da demo

Dashboard (seed Ana/Carlos/Agro) → Produtores → cria João (`529.982.247-25`, fora do seed) → fazenda → plantio → dashboard atualiza pizzas → DELETE João → 409 na tela → DELETE fazenda → DELETE João 204.

## Erros

O front não traduz invariante. Lê RFC 7807 (`status`, `title`, `detail`) e exibe `detail`.

| Status | UI |
|---|---|
| 400 | formulário (UF inválida, campo faltando) |
| 404 | página de detalhe |
| 409 | form ou bloco excluir (documento, plantio, produtor com fazenda) |
| 422 | form (CPF/CNPJ, áreas) |
| 204 | some da lista; sem toast de sucesso |
| rede | “Não foi possível falar com a API” |

RTK: `isLoading` / `isFetching` em botão e página.

## Testes

Jest + Testing Library em `web/`. MSW intercepta HTTP (item “dados mockados” do desafio). Sem Nest e sem Postgres.

Mínimo:

1. Dashboard: totais + três pizzas a partir de fixture no formato real da API
2. Lista de produtores a partir de `GET /api/v1/producers` mockado
3. Submit CPF inválido → MSW 422 → `detail` visível
4. Excluir produtor → MSW 409 → texto de fazendas cadastradas visível

`npm test` na raiz = back. `cd web && npm test` = front.

CI: job `web` (`npm ci` + test, e lint se houver) **dentro de `web/`**. Job da API intacto.

## README e qualidade

README da raiz: dois comandos (Compose + Vite), URLs `:3000` e `:5173`, Postman ainda na API, testes back vs front.

Pleno fullstack neste recorte: atomic visível, RTK no contrato existente, pizzas fiéis ao JSON, 409 na UI, testes MSW. Sem MFE, sem Next, sem dois sistemas de CSS.

## Fases

1. CORS no Nest, scaffold Vite em `web/`, store RTK, Header + 4 rotas, forms, pizzas, testes MSW, README, CI `web`
2. Opcional: Nginx no Compose servindo `web/dist` se a fase 1 estiver fechada e houver tempo

## Riscos

- CORS/proxy mal configurado → tela branca na demo. Mitigação: proxy Vite **e** `enableCors`
- Pizza de solo incluindo sobra → diverge do back. Mitigação: só `landUse`; texto no card
- RTK sem invalidar dashboard → pizza velha depois do POST. Mitigação: tags no `createApi`
- Tailwind/MUI “para ir mais rápido” → foge do CSS-in-JS + atomic do enunciado
- Microfrontend → teatro para um time e um CRUD
