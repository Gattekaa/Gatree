# Gatree

**Seu mundo. Em um link.**

Plataforma full stack para criar páginas de links, personalizar a presença digital e acompanhar como as pessoas interagem com o conteúdo. Reúne editor visual, analytics e encurtador de URLs em uma aplicação com versões em português e inglês.

Projeto pessoal de **Vinicius Martins**, com desenvolvimento de interfaces, regras de negócio, persistência, autenticação e publicação em produção.

[Acessar o Gatree](https://gatree.vercel.app) · [Meu portfólio](https://viniciusgabriel.vercel.app/pt) · [LinkedIn](https://www.linkedin.com/in/vinicius-martins-76a991216/) · [English overview](#english-overview)

[![Página inicial do Gatree em produção, com a identidade visual em preto e amarelo e uma prévia de página de links](docs/images/gatree-preview.jpg)](https://gatree.vercel.app)

## O produto

O Gatree atende criadores, profissionais e negócios que precisam reunir diferentes destinos em uma página compartilhável e entender quais conteúdos recebem atenção.

| Área | Funcionalidades |
| --- | --- |
| Editor | Múltiplas páginas por conta, preview, reordenação por arrastar e soltar, ativação e agendamento de links. |
| Conteúdo | Links, títulos, textos, imagens, mapas, contatos e embeds de YouTube, Spotify e SoundCloud. |
| Personalização | Temas, fundos animados, cores, tipografia, estilos de botão, avatar e ícones sociais. |
| Analytics | Visualizações, cliques, CTR, comparação entre períodos, origem do tráfego, localização aproximada e dispositivos. |
| Encurtador | URLs personalizadas, senha opcional, expiração, QR Code e métricas de cliques. |
| Conta | Login com Google, gerenciamento de sessões e tour guiado que acompanha a criação da primeira página. |

A interface oferece temas claro e escuro e layouts adaptados a desktop e mobile. O GitHub também está implementado como provedor OAuth e aparece quando suas credenciais são configuradas.

## Decisões de engenharia

- **Páginas públicas no servidor:** o App Router renderiza o conteúdo compartilhável e gera metadados, dados estruturados e sitemap a partir das páginas publicadas.
- **Editor com estado de servidor:** TanStack Query organiza consultas, cache e atualização dos dados; Server Actions concentram as operações de edição.
- **Persistência durante edições rápidas:** uma [fila de salvamento](components/editor/latest-save-queue.ts) serializa as gravações de aparência, conserva a alteração mais recente e combina mudanças pendentes quando necessário.
- **Autorização por proprietário:** as operações privadas validam a sessão e a relação entre o usuário e o recurso solicitado. As regras de acesso compartilhadas ficam em [auth-utils.ts](lib/auth-utils.ts).
- **Validação e processamento de uploads:** as imagens passam por verificações de tipo, tamanho e assinatura do arquivo antes do processamento com Sharp. A camada de [storage](lib/storage/index.ts) permite alternar entre Imgur, R2 e armazenamento local; a publicação atual utiliza Imgur.
- **Analytics por eventos:** visualizações e cliques são registrados separadamente do conteúdo, permitindo agregações por período, origem e dispositivo.
- **Onboarding com continuidade:** o [tour guiado](docs/onboarding.md) distingue cadastro, primeira árvore e execução manual, com progresso isolado por conta e tratamento de armazenamento indisponível no navegador.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Aplicação | Next.js 16, React 19, TypeScript, App Router e Server Actions |
| Interface | Tailwind CSS 4, Radix UI, React Hook Form, Zod e dnd-kit |
| Dados e autenticação | PostgreSQL, Prisma 7, Auth.js e TanStack Query |
| Visualização e movimento | Recharts, GSAP e Motion |
| Imagens | Sharp e Imgur; adaptadores disponíveis para R2 e disco local |
| Infraestrutura | Vercel e Neon; suporte opcional a Upstash Redis para rate limiting |

## Por onde começar a leitura do código

| Caminho | O que observar |
| --- | --- |
| [prisma/schema.prisma](prisma/schema.prisma) | Modelagem de usuários, páginas, links, sessões e eventos. |
| [actions/](actions/) | Regras de criação, edição, ordenação e autorização dos recursos. |
| [components/editor/](components/editor/) | Editor, preview, controles de aparência e persistência das edições. |
| [lib/tracking.ts](lib/tracking.ts) e [lib/analytics.ts](lib/analytics.ts) | Registro e agregação das interações com o conteúdo. |
| [lib/storage/](lib/storage/) | Contrato de upload e implementações por provedor. |
| [docs/](docs/) | Documentação do produto, identidade visual e onboarding. |

## Executar localmente

Requisitos: Node.js 24, npm e um banco PostgreSQL de desenvolvimento vazio.

```bash
git clone https://github.com/Gattekaa/Gatree.git
cd Gatree
npm ci
```

Crie um arquivo `.env` na raiz e preencha a conexão com seu banco, um segredo de autenticação e as credenciais OAuth:

```dotenv
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gatree?schema=public"
AUTH_URL="http://localhost:3000"
AUTH_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_SITE_VERIFICATION=""
STORAGE_PROVIDER="local"
```

Gere um valor aleatório para `AUTH_SECRET`, por exemplo com `openssl rand -base64 32`. No cliente OAuth do Google, autorize o retorno para `http://localhost:3000/api/auth/callback/google`.

Para verificar o site no Google Search Console, defina `GOOGLE_SITE_VERIFICATION` em produção com o valor de `content` da meta tag fornecida pelo Google. O sitemap dinâmico está disponível em `/sitemap.xml` e é indicado no `/robots.txt`.

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Abra [localhost:3000](http://localhost:3000). O comando `db push` acima prepara o banco de desenvolvimento a partir do schema atual.

Para utilizar o Imgur, configure `STORAGE_PROVIDER="imgur"` e `IMGUR_CLIENT_ID`. Para habilitar o login com GitHub, preencha `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` e cadastre o callback `/api/auth/callback/github` no aplicativo OAuth correspondente.

O runtime aceita `GATREE_DATABASE_URL` como conexão alternativa a `DATABASE_URL`. Quando houver `?schema=...` na URL, esse namespace também é passado explicitamente ao adaptador PostgreSQL.

## Verificação

```bash
npm run lint
npm run build
```

Os testes usam o runner nativo do Node.js com suporte a TypeScript pelo `tsx`:

```bash
node --import tsx --test \
  lib/onboarding.test.ts \
  components/onboarding/position.test.ts \
  components/onboarding/tour-plan.test.ts \
  components/editor/latest-save-queue.test.ts
```

Eles cobrem transições do onboarding, isolamento de progresso por conta, posicionamento do tour e comportamento da fila de salvamento em cenários de concorrência e falha.

O seed de demonstração (`npm run seed`) substitui dados. Use-o somente em um banco de desenvolvimento descartável; ele não faz parte da instalação acima.

## English overview

Gatree is a full-stack application for building customizable link pages, tracking audience interactions and managing short URLs. Built with Next.js, React, TypeScript, PostgreSQL and Prisma, it includes a visual editor, Google sign-in, event-based analytics, password-protected short links and a guided onboarding flow.

This personal project demonstrates my work across product interfaces, server-side authorization, data modeling, asynchronous state management and deployment. The codebase includes automated tests for onboarding and concurrent appearance saves, along with documentation of the main product flows.

[Live application](https://gatree.vercel.app) · [Portfolio in English](https://viniciusgabriel.vercel.app/en) · [LinkedIn](https://www.linkedin.com/in/vinicius-martins-76a991216/)
