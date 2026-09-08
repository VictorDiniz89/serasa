# Brain Agriculture API

API REST de cadastro de produtores rurais, fazendas, plantios por safra e dashboard agregado. Feita para o teste técnico de backend pleno (Node.js, TypeScript, NestJS, PostgreSQL).

Desafio de referência: [brain-ag/trabalhe-conosco](https://github.com/brain-ag/trabalhe-conosco).

Não há frontend nem Swagger UI. A demo é Postman + `openapi.yaml`.

## Pré-requisitos

- Node.js 22
- Docker e Docker Compose
- npm

## Subir com Docker

```bash
docker compose up --build
```

Sobe Postgres 16, aplica a migration, roda o seed e inicia a API em [http://localhost:3000](http://localhost:3000).

O seed cria 3 produtores, fazendas em SP/MT/GO e plantios (Soja, Milho, Café). O dashboard já vem preenchido. O Postman cria o João à parte (`529.982.247-25`) — esse CPF **não** está no seed, então o POST da collection não dá 409.

Para apagar tudo e voltar só o seed:

```bash
docker compose down -v
docker compose up --build
```

- Health: [http://localhost:3000/health](http://localhost:3000/health)
- Dashboard: [http://localhost:3000/api/v1/dashboard](http://localhost:3000/api/v1/dashboard)

`GET /` não existe (404 em `application/problem+json`). Prefixo da API: `/api/v1`.

Só o banco, para desenvolver local:

```bash
docker compose up -d postgres
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

## Testes

```bash
npm test              # unitários (domínio)
npm run test:e2e      # HTTP + Postgres
npm run typecheck
npm run lint:check
```

O e2e precisa do Postgres no ar (`docker compose up -d postgres`) e de `DATABASE_URL` no `.env`.

## Postman

1. Abra o Postman → Import
2. Selecione `postman/Brain-Agriculture.postman_collection.json`
3. A variável `baseUrl` já é `http://localhost:3000`
4. Rode as pastas na ordem: **Health → Produtores → Fazendas → Plantios → Dashboard → Erros**

Os requests de criar gravão `producerId`, `farmId` e `plantingId` para os próximos passos. A pasta **Erros** cobre CPF inválido (422), soma de áreas (422) e delete de produtor com fazenda (409).

Contrato equivalente: `openapi.yaml` na raiz (sem UI `/docs`).

## Rotas

| Método | Rota | O quê |
|---|---|---|
| GET | `/health` | Liveness |
| POST | `/api/v1/producers` | Cria produtor |
| GET | `/api/v1/producers` | Lista paginada |
| GET | `/api/v1/producers/:id` | Detalhe com fazendas |
| PATCH | `/api/v1/producers/:id` | Atualiza nome/documento |
| DELETE | `/api/v1/producers/:id` | 204, ou 409 se houver fazenda |
| POST | `/api/v1/producers/:id/farms` | Cria fazenda |
| GET | `/api/v1/farms/:id` | Detalhe com plantios |
| PATCH | `/api/v1/farms/:id` | Recalcula invariante de área |
| DELETE | `/api/v1/farms/:id` | 204; cascade nos plantios |
| POST | `/api/v1/farms/:id/plantings` | Plantio (get-or-create safra/cultura) |
| DELETE | `/api/v1/plantings/:id` | Remove só o plantio |
| GET | `/api/v1/dashboard` | Totais e séries para pizza |

Erros no formato RFC 7807 (`type`, `title`, `status`, `detail`, `requestId`). Header `x-request-id` é ecoado; se não vier, a API gera um UUID.

## Arquitetura

Clean Architecture leve — não é DDD/CQRS nem “controller + Prisma no mesmo arquivo”.

```text
HTTP → Presentation (controllers, DTOs, filtros)
         → Application (use cases)
              → Domain (CPF/CNPJ, áreas, UF, DomainError)
         → Application ports (interfaces)
              → Infrastructure (Prisma, pino)
                   → PostgreSQL
```

- **Domínio e use cases** não importam Nest nem Prisma.
- **Controller** só fala HTTP. Invariantes (dígito de CPF, soma de hectares) ficam no domínio.
- **Ports** isolam persistência. O módulo Nest só faz o wiring (`useFactory` + token).

### Por que 409

Conflito de regra de negócio que o cliente pode corrigir sem mudar o contrato: documento já cadastrado, plantio duplicado na mesma fazenda/safra/cultura, ou delete de produtor que ainda tem fazenda. 422 fica para invariante (CPF inválido, área estourada). 400 fica para DTO (campo faltando, UF inexistente).

### Por que sem Swagger UI

A apresentação é no Postman. Swagger UI vira uma página extra que não desenha a pizza do dashboard e foge do combinado. O contrato versionado é `openapi.yaml` + a collection.

## Logs

JSON via pino, sem body (documento não vaza). Campos: `requestId`, `method`, `route`, `status`, `durationMs`, `producerId`/`farmId` quando a rota tiver.

## Seed

Três produtores, fazendas em SP, MT e GO, culturas Soja, Milho e Café — o dashboard não nasce vazio.

```bash
npm run prisma:seed
```
