# AGENTS.md

## Objetivo

Este repositório é um template de API NestJS para projetos com Prisma, PostgreSQL, autenticação JWT e multi-tenancy em `single database`.

Ao trabalhar neste projeto, preserve a arquitetura existente. Novas funcionalidades devem seguir o mesmo desenho dos módulos `users`, `tenants`, `auth` e `cryptography`, evitando atalhos que acoplem HTTP, regra de negócio e persistência.

## Stack principal

- Node.js + TypeScript
- NestJS 11
- Fastify
- Prisma 7
- PostgreSQL
- `@prisma/adapter-pg`
- JWT com Passport
- `bcryptjs`
- `class-validator` / `class-transformer`
- Zod para configuração e validações de infraestrutura
- Jest
- ESLint + Prettier
- pnpm

Use `pnpm` como gerenciador de pacotes.

## Comandos

Instalação:

```bash
pnpm install
```

Desenvolvimento:

```bash
pnpm dev
```

Build:

```bash
pnpm build
```

Lint:

```bash
pnpm lint
```

Testes:

```bash
pnpm test
pnpm test:watch
pnpm test:cov
pnpm test:e2e
```

Prisma:

```bash
pnpm prisma:generate
pnpm prisma:migrate --name <migration-name>
pnpm prisma:deploy
pnpm prisma:studio
pnpm prisma:seed
pnpm prisma:reset
```

Antes de considerar uma alteração concluída, execute sempre que aplicável:

```bash
pnpm lint
pnpm test
pnpm build
```

Se `prisma/schema.prisma` tiver sido alterado, execute também:

```bash
pnpm prisma:generate
```

e crie a migration correspondente quando a alteração modificar o banco.

## Estrutura do projeto

A organização principal é:

```text
src/
├── common/
│   ├── decorators/
│   ├── domain/
│   ├── exceptions/
│   ├── interceptors/
│   ├── pagination/
│   └── utils/
├── infrastructure/
│   ├── database/
│   │   └── prisma/
│   └── env/
├── lib/
│   └── prisma.ts
├── modules/
│   ├── auth/
│   ├── cryptography/
│   ├── tenants/
│   └── users/
├── app.module.ts
└── main.ts

prisma/
├── generated/
├── migrations/
├── schema.prisma
└── seeds/
```

Responsabilidades:

- `src/main.ts`: bootstrap e configuração global da aplicação.
- `src/common`: código compartilhado entre domínios.
- `src/infrastructure`: integrações e infraestrutura transversal.
- `src/modules`: regras e casos de uso organizados por domínio.
- `prisma/schema.prisma`: modelo persistido.
- `prisma/generated`: Prisma Client gerado automaticamente.
- `prisma/seeds`: scripts de seed.

Nunca edite arquivos dentro de `prisma/generated` manualmente.

## Arquitetura de módulos

Novos domínios devem, quando fizer sentido, seguir esta estrutura:

```text
src/modules/<domain>/
├── dtos/
├── entities/
├── http/
├── repositories/
├── services/
├── utils/
└── <domain>.module.ts
```

Nem todo módulo precisa obrigatoriamente de todas as pastas. Crie apenas as camadas necessárias, mantendo a separação de responsabilidades.

O fluxo esperado é:

```text
Controller
  -> DTO
  -> Service
  -> Repository Contract
  -> Repository Implementation
  -> Prisma
```

### Controllers

Controllers pertencem à camada HTTP.

Regras:

- devem ser finos;
- não devem conter regra de negócio;
- não devem acessar Prisma diretamente;
- devem receber e validar entrada;
- devem extrair contexto HTTP/autenticação;
- devem delegar o caso de uso para um service;
- prefira um controller por caso de uso, seguindo o padrão atual de `users`.

Exemplo conceitual:

```ts
@Controller('resources')
export class CreateResourceController {
  constructor(private readonly createResource: CreateResourceService) {}

  @Post()
  async create(
    @CurrentUser() user: UserPayload,
    @Body() body: CreateResourceDto,
  ) {
    return this.createResource.execute(user.tenantId, body);
  }
}
```

Não retorne envelopes HTTP manualmente nos controllers. O `ResponseInterceptor` global é responsável por padronizar respostas de sucesso.

### Services

Services concentram regra de negócio.

Padrão preferencial:

```ts
@Injectable()
export class CreateResourceService {
  constructor(private readonly resources: ResourceContract) {}

  async execute(...) {
    // regra de negócio
  }
}
```

Regras:

- use `execute` como método principal do caso de uso quando seguir o padrão atual;
- faça validações de negócio no service;
- lance as exceções de domínio disponíveis em `src/common/domain`;
- não acesse diretamente `PrismaService` em services;
- dependa de contratos/abstrações em vez de implementações concretas;
- dados sensíveis devem ser removidos antes do retorno.

### Repositories

Cada domínio que persiste dados deve expor um contrato de repositório.

Padrão:

```ts
export abstract class ResourceContract {
  abstract create(...): Promise<...>;
  abstract findById(...): Promise<...>;
}
```

A implementação concreta deve:

- implementar o contrato;
- receber `PrismaService` via injeção;
- concentrar queries do Prisma;
- não conter regra de negócio;
- aplicar o escopo de tenant nas operações em que isso puder ser garantido na query.

No módulo:

```ts
{
  provide: ResourceContract,
  useClass: ResourceRepository,
}
```

Não injete `ResourceRepository` diretamente nos services quando existir um contrato correspondente.

### DTOs

Inputs HTTP devem usar DTOs com `class-validator`.

Exemplo:

```ts
export class CreateResourceDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  name!: string;
}
```

Regras:

- use decorators explícitos de validação;
- siga o padrão atual de mensagens em português;
- use `@IsOptional()` para campos opcionais;
- use `@IsEnum()` para enums;
- não use tipos Prisma como DTO HTTP;
- mantenha DTOs separados das entidades de domínio.

A aplicação possui `ValidationPipe` global com transformação e conversão implícita habilitadas.

### Entities e tipos de domínio

Tipos de domínio vivem em `entities/`.

Evite acoplar toda a regra de negócio diretamente aos tipos gerados pelo Prisma.

Quando houver enum usado pelo domínio, siga o padrão existente quando apropriado:

```ts
export const ResourceStatus = {
  active: 'active',
  inactive: 'inactive',
} as const;

export type ResourceStatus =
  (typeof ResourceStatus)[keyof typeof ResourceStatus];
```

## Multi-tenancy

O projeto usa `single database` com `tenantId` para isolamento dos dados.

Esta é uma regra crítica do projeto.

### Regras obrigatórias

- recursos pertencentes a uma organização devem possuir `tenantId`;
- o `tenantId` autenticado deve vir do token JWT;
- não confie em `tenantId` enviado pelo body, query string ou params para definir o tenant atual;
- listagens devem filtrar pelo `tenantId`;
- update e delete devem ser explicitamente escopados pelo `tenantId`;
- buscas por ID devem verificar que o registro pertence ao tenant autenticado;
- um usuário de um tenant nunca pode acessar dados de outro tenant;
- ao criar novos relacionamentos multi-tenant, considere índices e constraints adequadas no Prisma.

O JWT atual possui:

```ts
{
  sub: string;
  tenantId: string;
  role: 'admin' | 'member';
}
```

Use `@CurrentUser()` para obter esse contexto nas rotas autenticadas.

### Segurança contra vazamento entre tenants

Ao implementar qualquer novo endpoint, revise explicitamente:

1. de onde vem o `tenantId`;
2. se a consulta está limitada ao tenant;
3. se IDs recebidos externamente podem apontar para registros de outro tenant;
4. se update/delete usam chave ou filtro tenant-aware;
5. se relacionamentos carregados também pertencem ao mesmo tenant quando necessário.

Prefira retornar `NotFoundException` para um recurso de outro tenant quando isso evitar revelar sua existência.

## Autenticação

O `JwtAuthGuard` é registrado globalmente.

Isso significa que novas rotas são privadas por padrão.

Para uma rota realmente pública, use o decorator existente:

```ts
@Public()
```

Não desative autenticação global para facilitar um endpoint.

Rotas públicas devem ser uma decisão explícita.

Ao alterar autenticação:

- preserve a validação do payload JWT;
- preserve `sub`, `tenantId` e `role`, salvo mudança arquitetural intencional;
- use abstrações do módulo `cryptography`;
- não acople services diretamente a `bcryptjs` ou `JwtService` se já houver contrato para essa responsabilidade.

## Senhas e dados sensíveis

Senhas nunca devem ser retornadas pela API.

Use o padrão existente de sanitização, como `withoutUserPassword`, ou crie equivalente específico quando necessário.

Regras:

- nunca retorne hashes de senha;
- nunca registre senha, token JWT, `JWT_SECRET` ou credenciais;
- senha deve ser hasheada através da abstração de criptografia;
- comparação de senha deve usar a abstração correspondente;
- não coloque secrets no código-fonte;
- novas variáveis sensíveis devem ser adicionadas ao schema de ambiente e ao `.env.example` sem valores reais.

## Exceções e respostas HTTP

O projeto possui exceções próprias em `src/common/domain/http.errors.ts`.

Prefira:

- `BadRequestException`
- `UnauthorizedException`
- `ForbiddenException`
- `NotFoundException`
- `ConflictException`

Use essas exceções para manter compatibilidade com o filtro global.

Não crie formatos de erro ad hoc dentro de controllers.

Respostas de sucesso são envolvidas pelo interceptor global aproximadamente no formato:

```ts
{
  status: 'success',
  data: ...,
  message: 'Operação concluída com sucesso',
  pagination?: ...
}
```

Para resultados paginados, retorne do service/repository o formato compartilhado:

```ts
{
  data: T[];
  pagination: {
    total: number;
    page: number;
    lastPage: number;
    perPage: number;
  };
}
```

## Paginação

Use `PaginationService` em vez de reimplementar paginação em cada repository.

O padrão compartilhado trabalha com:

```ts
interface PaginationParams {
  page: number;
  perPage: number;
}
```

Repositories devem fornecer funções de `count` e `findMany` ao serviço de paginação.

Não retorne listas potencialmente grandes sem paginação quando o recurso puder crescer significativamente.

## Prisma

O Prisma usa PostgreSQL com `@prisma/adapter-pg`.

Regras:

- altere modelos apenas em `prisma/schema.prisma`;
- não edite `prisma/generated`;
- gere novamente o client depois de alterar o schema;
- use migrations para mudanças persistentes de banco;
- mantenha nomes e relações coerentes com os domínios;
- adicione índices para campos usados frequentemente em filtros;
- relações multi-tenant devem preservar isolamento por tenant;
- evite queries Prisma diretamente em controllers e services.

O `PrismaService` deve continuar sendo a principal porta de acesso ao banco dentro da aplicação Nest.

O arquivo `src/lib/prisma.ts` existe para cenários fora do container Nest, como seeds.

## Variáveis de ambiente

O ambiente é validado com Zod.

Variáveis atuais principais:

```text
DATABASE_URL
JWT_SECRET
NODE_ENV
PORT
```

Ao adicionar uma nova variável:

1. adicione-a ao schema de `src/infrastructure/env/env.ts`;
2. exponha-a através da infraestrutura de environment existente;
3. atualize `.env.example`;
4. nunca faça commit de valores secretos reais.

Evite acessar `process.env` diretamente em regras de negócio. Prefira a infraestrutura de configuração existente.

## Convenções de código

Siga o estilo existente.

### Imports

O alias configurado é:

```ts
@/*
```

para:

```text
src/*
```

Prefira `@/` para imports entre áreas distantes do projeto e imports relativos para arquivos próximos dentro do mesmo módulo.

### Nomes de arquivos

O projeto usa nomes em lowercase separados por pontos em diversos casos, por exemplo:

```text
create.user.service.ts
create.user.controller.ts
user.contract.ts
user.repository.ts
jwt.auth.guard.ts
```

Ao criar arquivos dentro de módulos existentes, preserve o padrão local em vez de introduzir uma convenção nova.

### TypeScript

- mantenha tipagem explícita onde ela melhorar contratos;
- evite `any` novo sem necessidade, mesmo que a regra do ESLint permita;
- use interfaces/types de domínio para fronteiras importantes;
- respeite `strictNullChecks`;
- não silencie erros TypeScript apenas com casts desnecessários;
- não use tipos gerados do Prisma como substituto automático para contratos HTTP ou de domínio.

### Formatação

Deixe ESLint e Prettier definirem o estilo.

Não faça alterações de formatação não relacionadas à tarefa em muitos arquivos.

## Adicionando um novo módulo

Para um novo domínio multi-tenant, normalmente:

1. adicione ou altere o model em `prisma/schema.prisma`;
2. gere a migration;
3. gere novamente o Prisma Client;
4. crie `entities/`;
5. crie `dtos/`;
6. crie o contrato em `repositories/`;
7. crie a implementação Prisma do repository;
8. crie um service por caso de uso;
9. crie controllers finos em `http/`;
10. registre controllers, services e bindings no módulo;
11. importe o módulo em `AppModule`;
12. garanta que `tenantId` seja propagado corretamente;
13. adicione testes;
14. rode lint, testes e build.

Estrutura de referência:

```text
src/modules/resources/
├── dtos/
│   ├── create.resource.dto.ts
│   └── update.resource.dto.ts
├── entities/
│   └── resource.entity.ts
├── http/
│   ├── create.resource.controller.ts
│   ├── find.all.resources.controller.ts
│   ├── find.resource.by.id.controller.ts
│   ├── update.resource.controller.ts
│   └── delete.resource.controller.ts
├── repositories/
│   ├── resource.contract.ts
│   └── resource.repository.ts
├── services/
│   ├── create.resource.service.ts
│   ├── find.all.resources.service.ts
│   ├── find.resource.by.id.service.ts
│   ├── update.resource.service.ts
│   └── delete.resource.service.ts
└── resource.module.ts
```

Adapte essa estrutura ao domínio; não crie arquivos vazios apenas para reproduzir a árvore.

## Testes

Ao adicionar ou alterar regra de negócio:

- priorize testes dos services;
- mocke contratos de repository e abstrações externas;
- cubra casos de sucesso e falha;
- inclua casos de isolamento por tenant;
- teste conflitos de unicidade quando houver;
- teste autenticação/autorização quando a mudança afetar segurança;
- não dependa de estado compartilhado entre testes.

Para bugs, prefira primeiro reproduzir o comportamento com um teste e depois corrigir.

O Jest está configurado para aceitar uma suíte vazia, mas isso não significa que novas funcionalidades devam ficar sem cobertura quando forem testáveis.

## Checklist antes de finalizar uma tarefa

Verifique:

- [ ] A mudança segue a arquitetura existente.
- [ ] Controllers continuam finos.
- [ ] Regra de negócio está nos services.
- [ ] Persistência está isolada nos repositories.
- [ ] Services dependem de contratos, quando aplicável.
- [ ] O isolamento por `tenantId` foi preservado.
- [ ] Nenhuma senha ou segredo é retornado/logado.
- [ ] DTOs possuem validação adequada.
- [ ] Exceções seguem o padrão compartilhado.
- [ ] `prisma/generated` não foi alterado manualmente.
- [ ] Alterações no schema possuem Prisma Client atualizado e migration quando necessário.
- [ ] Testes relevantes foram adicionados/atualizados.
- [ ] `pnpm lint` passa.
- [ ] `pnpm test` passa.
- [ ] `pnpm build` passa.

## Regras para agentes

Ao receber uma tarefa:

1. leia os arquivos diretamente relacionados antes de modificar código;
2. identifique o padrão equivalente em um módulo existente e replique a arquitetura, não necessariamente o código;
3. faça a menor alteração coerente que resolva a tarefa;
4. não refatore áreas não relacionadas sem necessidade;
5. não troque bibliotecas ou arquitetura existente sem solicitação explícita;
6. não introduza dependências quando uma solução simples já existir no projeto;
7. preserve compatibilidade com Fastify;
8. preserve a autenticação global;
9. trate isolamento multi-tenant como requisito de segurança;
10. nunca invente campos, endpoints ou comportamento sem verificar o schema e os módulos relacionados;
11. quando houver ambiguidade, prefira a solução mais consistente com os padrões já presentes no repositório;
12. ao terminar, informe resumidamente os arquivos alterados e as verificações executadas.

## Princípio geral

Este template prioriza previsibilidade e separação de responsabilidades.

Ao escolher entre uma solução mais curta e uma solução consistente com a arquitetura existente, prefira a solução consistente com a arquitetura.
