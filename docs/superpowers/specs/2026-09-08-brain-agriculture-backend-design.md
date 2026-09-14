# Brain Agriculture — API backend (teste Serasa Experian)

Data: 2026-09-08  
Status: aprovada — você implementa ponto a ponto; código só no chat  
Fonte do desafio: [brain-ag/trabalhe-conosco](https://github.com/brain-ag/trabalhe-conosco)

API REST para cadastro de produtores rurais, fazendas, culturas por safra e dashboard agregado. Entrega alinhada à vaga de desenvolvedor pleno backend (Node.js, TypeScript, NestJS, Postgres, testes, Docker, observabilidade).

## Objetivo

Mostrar interpretação de domínio, camadas, código testável e contrato de API. Não mostrar microsserviço, fila nem front.

Critério de pronto: outro pleno sobe com Docker, roda os testes, importa o Postman e percorre o fluxo da apresentação sem perguntar no WhatsApp.

## Fora de escopo

- Frontend React, gráficos renderizados, microfrontend — **depois atualizado**: ver `2026-09-14-brain-agriculture-frontend-design.md` (SPA em `web/`)
- Autenticação, JWT, RBAC
- Microsserviços, SQS/SNS, Kafka, Kubernetes, Terraform
- MongoDB
- Swagger UI (`/docs`)
- Deploy AWS (fase posterior, só se o núcleo estiver pronto e houver tempo)
- Transferência de fazenda entre produtores
- Cadastro aninhado produtor+fazendas num único POST
- Soft delete

## Stack

| Peça | Escolha |
|---|---|
| Runtime | Node.js 20 LTS |
| Linguagem | TypeScript (strict) |
| Framework | NestJS |
| ORM | Prisma |
| Banco | PostgreSQL 16 |
| Testes | Jest + supertest |
| Logs | pino (JSON) via nestjs-pino |
| Validação HTTP | class-validator + class-transformer |
| Pacotes | npm |
| Container | Docker + Compose (API + Postgres) |
| CI | GitHub Actions: lint, test, build da imagem |
| Contrato | `openapi.yaml` na raiz (sem UI) |
| Demo | Collection Postman versionada |

## Arquitetura

Clean Architecture leve: domínio e casos de uso não importam Nest nem Prisma. Controllers e Prisma são adapters. MVC fica só na borda HTTP (controller + DTO). Não há View.

```text
HTTP → Presentation (controllers, DTOs, filtros)
         → Application (use cases)
              → Domain (entidades, value objects, invariantes)
         → Application ports (interfaces de repositório)
              → Infrastructure (Prisma, logger, config)
                   → PostgreSQL
```

### Pastas

```text
src/
  domain/           entidades, value objects, erros de domínio
  application/      use cases + ports
  infrastructure/   prisma, logger, config
  presentation/     controllers, DTOs, exception filters
  modules/          wiring Nest (Producers, Farms, Plantings, Dashboard)
```

Módulos Nest: `producers`, `farms`, `plantings`, `dashboard`. Shared: validação de UF, pipes, filtro HTTP, request id.

## Domínio

### Entidades

**Producer**

- `id` UUID
- `name` string (trim, 2–255)
- `document` só dígitos, único no banco
- `documentType` `CPF` (11 dígitos) ou `CNPJ` (14 dígitos)
- `createdAt` / `updatedAt` UTC

O cliente envia o documento com ou sem máscara. A API normaliza (só dígitos), infere o tipo pelo comprimento (11 = CPF, 14 = CNPJ) e valida dígitos verificadores. Comprimento diferente de 11 ou 14 → 422. Rejeitar documentos trivialmente inválidos (`00000000000`, `11111111111`, CNPJ analogamente). Um produtor tem 0..N fazendas.

**Farm**

- `id` UUID
- `producerId` obrigatório (fazenda sem produtor não existe)
- `name`, `city` (trim, obrigatórios)
- `state` UF IBGE (27 valores, inclusive `DF`), sempre maiúscula
- `totalAreaHa`, `arableAreaHa`, `vegetationAreaHa` decimal com 2 casas

Invariante: `arableAreaHa + vegetationAreaHa <= totalAreaHa`. Todas as áreas `>= 0`. `totalAreaHa > 0`. Sobra (total − soma) é permitida e **não** entra na pizza de uso do solo.

**Harvest** e **Crop**

Catálogos internos. Campos `name` (texto da primeira ocorrência, trim) e `nameKey` (`lower(trim(name))`, unique). Get-or-create pela `nameKey`. Não há CRUD público.

**FarmCrop** (plantio)

- `farmId`, `harvestId`, `cropId`
- Unique `(farmId, harvestId, cropId)`
- Uma fazenda tem 0..N plantios; várias culturas na mesma safra

### Exclusão

- `DELETE /producers/:id` com fazenda existente → **409** (apagar ou não ter fazendas antes)
- `DELETE /farms/:id` remove a fazenda e os plantios (cascade)
- `DELETE /plantings/:id` remove só o plantio
- Safra/cultura órfã pode permanecer no catálogo (sem job de limpeza)

### Dashboard (leitura)

Um endpoint. Sem gráfico: séries para pizza.

| Campo | Significado |
|---|---|
| `totalFarms` | quantidade de fazendas |
| `totalHectares` | soma de `totalAreaHa` |
| `farmsByState` | `{ state, count }[]` — pizza por estado |
| `cropsPlanted` | `{ crop, count }[]` — pizza por cultura (`count` = linhas de plantio) |
| `landUse` | `{ arableHectares, vegetationHectares }` — pizza de uso do solo |

## API

Base: `/api/v1`. Health (fora do prefixo): `GET /health` → `{ status: "ok" }`.

Erros: `application/problem+json` (RFC 7807) com `type`, `title`, `status`, `detail`, `requestId`.

| HTTP | Quando |
|---|---|
| 400 | DTO malformado (tipo, campo obrigatório, UF inexistente) |
| 404 | Recurso inexistente |
| 409 | Documento duplicado; plantio duplicado; delete de produtor com fazenda |
| 422 | Invariante de domínio (CPF/CNPJ inválido, soma de áreas, total ≤ 0) |

Listagens: `page` (1-based, default 1), `limit` (default 20, max 100). Resposta: `{ data, meta: { page, limit, total } }`.

Ids nas rotas: UUID. UUID inválido → 400.

### Rotas

| Método | Rota | Comportamento |
|---|---|---|
| POST | `/producers` | Cria produtor |
| GET | `/producers` | Lista paginada, sem fazendas aninhadas |
| GET | `/producers/:id` | Detalhe com fazendas (sem plantios) |
| PATCH | `/producers/:id` | Nome e/ou documento; revalida unicidade e dígitos |
| DELETE | `/producers/:id` | 204 se sem fazendas; 409 se tiver |
| POST | `/producers/:id/farms` | Cria fazenda do produtor |
| GET | `/farms/:id` | Detalhe com plantios (`harvestName`, `cropName`) |
| PATCH | `/farms/:id` | Recalcula invariante de área no estado final |
| DELETE | `/farms/:id` | 204; cascade nos plantios |
| POST | `/farms/:id/plantings` | Body `{ harvestName, cropName }`; get-or-create catálogo |
| DELETE | `/plantings/:id` | 204 |
| GET | `/dashboard` | Agregados descritos acima |

Não há `PUT` (substituição total). Não há transferência de `producerId` no PATCH da fazenda.

### Documentação da API

- Sem `@nestjs/swagger` e sem UI `/docs`
- `postman/Brain-Agriculture.postman_collection.json` com pastas na ordem da apresentação: health → produtores → fazendas → plantios → dashboard → erros (CPF inválido, área estourada, 409)
- Variável `baseUrl` = `http://localhost:3000`. Health usa `{{baseUrl}}/health`; o restante usa `{{baseUrl}}/api/v1/...`
- `openapi.yaml` na raiz, alinhado às rotas (escrito junto da collection; os dois não divergem)

## Persistência

Prisma schema = fonte do modelo. Migration versionada. Seed no Compose (e `npm run prisma:seed`) com 3 produtores, fazendas em UFs diferentes, culturas distintas, para o dashboard não nascer vazio.

Índices unique: `producer.document`; `farm_crop (farmId, harvestId, cropId)`; `harvest.nameKey`; `crop.nameKey`.

Áreas: `Decimal(12,2)`.

## Observabilidade

- Log JSON: `requestId`, método, rota, status, duração em ms, `producerId`/`farmId` quando houver
- Documento: só máscara (`***` + 4 últimos dígitos) — nunca o número completo
- `requestId`: header `x-request-id` ou UUID gerado; ecoado na resposta e no problem+json

## Testes

| Camada | O quê |
|---|---|
| Unitário (`domain`) | CPF/CNPJ (válidos, inválidos, máscara); invariante de área (limite, estouro, zeros) |
| Integração (`application`) | Use cases contra Postgres (Compose local; service container no GitHub Actions) |
| E2E HTTP | Fluxo feliz + 422 área + 422 documento + 409 delete + dashboard |

CI não passa se lint, typecheck ou testes falharem. Fixtures mockadas só no unitário de domínio; integração usa banco real.

## Docker e README

- `Dockerfile` multi-stage (build + runtime)
- `docker-compose.yml`: API, Postgres, migrate no start, seed
- README em português: pré-requisitos, `docker compose up`, como rodar testes, como importar o Postman, decisões de arquitetura (por que Clean Architecture leve, por que 409, por que sem Swagger UI), diagrama das camadas

## Qualidade de pleno (sem teatro)

Incluir: camadas nítidas, invariantes no domínio, testes que quebram regra de negócio, problem+json, logs, Docker, CI, README honesto.

Não incluir: event bus interno “para o futuro”, DDD com dezenas de aggregates, CQRS, hexágono com 15 ports.

## Fases

1. Núcleo: domínio, Prisma, CRUD, dashboard, testes, Docker, Postman, OpenAPI, CI, README
2. Opcional: deploy AWS (App Runner ou equivalente) se a fase 1 estiver fechada e houver tempo

## Riscos

- Tratar cultura/safra como string livre sem normalizar → pizza quebrada. Mitigação: catálogo get-or-create case-insensitive
- Swagger UI no lugar da spec → foge do combinado da apresentação. Mitigação: arquivo OpenAPI + Postman
- Overengineering de filas/microsserviço → dilui a nota de pleno neste CRUD
