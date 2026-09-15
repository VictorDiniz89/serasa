# Brain Agriculture

Teste **fullstack** Serasa Experian ([brain-ag/trabalhe-conosco](https://github.com/brain-ag/trabalhe-conosco)): produtores rurais, fazendas, plantios e dashboard com três pizzas. Um repo; API e SPA se falam por HTTP `/api/v1`.

| Peça | Pasta | URL |
|---|---|---|
| API (NestJS + Postgres) | raiz | http://localhost:3000 |
| SPA (Vite + React) | `web/` | http://localhost:5173 |

## Como rodar

Precisa de **Docker Desktop**. Node 22 só para o SPA (e se for desenvolver a API fora do container).

**1. API** — um terminal:

```bash
docker compose up --build
```

Espere `Nest application successfully started`.

- http://localhost:3000/health → `{ "status": "ok" }`
- http://localhost:3000/api/v1/dashboard → 3 fazendas, 770 ha

**2. SPA** — outro terminal, com a API no ar:

```bash
cd web
npm install
npm run dev
```

Abra **http://localhost:5173**. O Vite encaminha `/api` para `:3000`.

**3. Testes**

```bash
npm test              # API (domínio)
cd web && npm test    # SPA (Jest + MSW, sem Postgres)
```

Postman fala com `http://localhost:3000` (`postman/Brain-Agriculture.postman_collection.json`). Não tem Swagger UI; o contrato é `openapi.yaml`.

Zerar o banco e voltar o seed: `docker compose down -v` e de novo o passo 1. `GET /` na API é 404 de propósito (rotas em `/api/v1`).

Decisões de desenho (arquivos separados): [API](docs/superpowers/specs/2026-09-08-brain-agriculture-backend-design.md) · [SPA](docs/superpowers/specs/2026-09-14-brain-agriculture-frontend-design.md)

## O que o seed cria

| Produtor | Documento | Fazenda | UF | Plantios |
|---|---|---|---|---|
| Carlos Souza | `111.444.777-35` | Fazenda Santa Rita | SP | Soja, Milho |
| Ana Lima | `390.533.447-05` | Fazenda Pantanal | MT | Soja |
| Agro Cerrado Ltda | `11.222.333/0001-81` | Fazenda Cerrado | GO | Café |

O Postman cria o **João da Silva** (`529.982.247-25`). Esse CPF **não** está no seed, então o `POST` da collection não dá 409.

## Postman

1. Postman → **Import** → `postman/Brain-Agriculture.postman_collection.json`
2. `baseUrl` já é `http://localhost:3000`
3. Rode **um request por vez**, nesta ordem: **Health → Produtores → Fazendas → Plantios → Dashboard → Erros**

Os `POST` de criar gravam `producerId`, `farmId` e `plantingId` para os próximos passos.

**DELETE** fica no fim das pastas Produtores e Fazendas. **Não rode no meio da demo** — o 409 de Erros precisa do produtor ainda com fazenda.

Para apagar de verdade:

1. `GET /api/v1/producers/:id` — olhe `farms` (a quantidade é `farms.length`)
2. `DELETE /api/v1/farms/:farmId` → **204** (plantios da fazenda saem junto)
3. `DELETE /api/v1/producers/:producerId` → **204**

Se o produtor ainda tiver fazenda, o delete dele responde **409**. Body vazio no 204 é o sucesso (sem mensagem JSON).

Pasta **Erros**: CPF inválido (422), soma de áreas (422), delete de produtor com fazenda (409).

## Rodar sem Docker na API

Sobe só o Postgres e a API no seu Node:

```bash
docker compose up -d postgres
```

Copie o `.env` (Windows / Unix):

```bash
copy .env.example .env
# cp .env.example .env
```

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

## Testes

```bash
npm test              # API: unitários (domínio)
npm run test:e2e      # API: HTTP + Postgres
npm run typecheck
npm run lint:check

cd web && npm test    # SPA: Jest + MSW, sem Postgres
```

O e2e precisa do Postgres no ar e de `DATABASE_URL` no `.env`. Banco sujo (mesmo CPF de um teste anterior) pode dar 409 no e2e local; o CI sobe Postgres vazio.

CI a cada push: job **test** (lint, typecheck, unit, e2e da API), job **docker** (build da imagem) e job **web** (lint, `tsc` e Jest em `web/`).

## Rotas

| Método | Rota | O quê |
|---|---|---|
| GET | `/health` | Liveness |
| POST | `/api/v1/producers` | Cria produtor |
| GET | `/api/v1/producers` | Lista paginada (sem fazendas) |
| GET | `/api/v1/producers/:id` | Detalhe **com** fazendas |
| PATCH | `/api/v1/producers/:id` | Atualiza nome/documento |
| DELETE | `/api/v1/producers/:id` | 204, ou 409 se houver fazenda |
| POST | `/api/v1/producers/:id/farms` | Cria fazenda |
| GET | `/api/v1/farms/:id` | Detalhe com plantios |
| PATCH | `/api/v1/farms/:id` | Recalcula invariante de área |
| DELETE | `/api/v1/farms/:id` | 204; cascade nos plantios |
| POST | `/api/v1/farms/:id/plantings` | Plantio (cria safra/cultura se não existir) |
| DELETE | `/api/v1/plantings/:id` | Remove só o plantio |
| GET | `/api/v1/dashboard` | Totais e séries para pizza |

Paginação: `page` começa em 1 (padrão 1), `limit` padrão 20, máximo 100.

Erros em RFC 7807 (`type`, `title`, `status`, `detail`, `requestId`). Header `x-request-id` é ecoado; se não vier, a API gera um UUID.

| Status | Quando |
|---|---|
| 400 | DTO (campo faltando, UF inválida) |
| 404 | Recurso não existe |
| 409 | Documento já cadastrado, plantio duplicado, ou delete de produtor com fazenda |
| 422 | CPF/CNPJ inválido, ou `arable + vegetation > total` |

## Regras de negócio

- CPF/CNPJ com dígitos verificadores; documento único (só dígitos no banco).
- Áreas ≥ 0, total > 0, e `arable + vegetation ≤ total`. O que sobra **não** entra na pizza de uso do solo.
- Produtor 1—N fazendas; fazenda 1—N plantios. Apagar fazenda remove os plantios. Apagar produtor **não** cascadeia fazendas.
- Dashboard: `totalFarms`, `totalHectares`, `farmsByState`, `cropsPlanted` (conta **linhas** de plantio), `landUse`.

## Arquitetura

O SPA é só UI. CPF, hectares e 409 continuam no domínio da Nest.

```text
Browser (Vite :5173)
  → RTK Query /api/v1
       → proxy Vite e/ou CORS
            → Nest :3000
                 → PostgreSQL
```

Na API, Clean Architecture leve — domínio e use cases não importam Nest nem Prisma.

```text
HTTP → Presentation (controllers, DTOs, filtros)
         → Application (use cases)
              → Domain (CPF/CNPJ, áreas, UF, DomainError)
         → Application ports (interfaces)
              → Infrastructure (Prisma, pino)
                   → PostgreSQL
```

- **Controller** só fala HTTP. Invariantes ficam no domínio.
- **Ports** isolam persistência. O módulo Nest só faz o wiring.
- Sem Swagger UI: a apresentação é no Postman; o contrato versionado é `openapi.yaml`.
- Por que 409 no delete, por que pizza de solo sem sobra, por que Vite e não Next: specs linkadas no topo.

## Logs

JSON via pino, sem body (documento não vaza). Campos: `requestId`, `method`, `route`, `status`, `durationMs`, e `producerId`/`farmId` quando a rota tiver.
