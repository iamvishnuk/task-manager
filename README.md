# Task Manager Monorepo

This is a modern task manager application built as a monorepo utilizing a Next.js frontend, an Express API backend, and shared TypeScript configurations and UI components.

## Prerequisites

- **Node.js**: `v20` or higher
- **pnpm**: `v10` or higher (package manager)
- **Docker**: (Optional, if running via containers)
- **PostgreSQL**: (Required if running locally without Docker)

---

## 🛠️ Environment Setup

Both applications require environment variables to function correctly. Example templates are provided in the respective directories.

### 1. API App Environment Variables

Copy the example file to `.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

Open `apps/api/.env` and update the database connection string, JWT secrets, and storage configurations if needed.

### 2. Web App Environment Variables

Copy the example file to `.env.local`:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Open `apps/web/.env.local` and set `NEXT_PUBLIC_API_URL` to point to your API server (default is `http://localhost:8000/api/v1`).

---

## 🐳 Running with Docker (Recommended / Quick Start)

Docker Compose sets up the Express API server, the Next.js frontend, and a PostgreSQL database instance automatically.

1. Ensure Docker is running.
2. Build and start all services:
   ```bash
   docker compose up --build
   ```
3. The applications will be accessible at:
   - **Frontend (Web)**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)

_Note: In the Docker environment, database migrations are handled during the startup sequence, and the required environment variables are preset inside `docker-compose.yml`._

---

## 💻 Running Locally (Without Docker)

To run the project locally on your machine, you will need a running PostgreSQL instance.

### 1. Install Dependencies

At the root of the repository, install all dependencies:

```bash
pnpm install
```

### 2. Set Up the Database

Ensure PostgreSQL is running and you have created a database matching the `DATABASE_URL` in `apps/api/.env`.

Run the database migrations or push schema directly:

```bash
pnpm --filter api db:push
```

_(Or `pnpm --filter api db:migrate` if pre-generated migrations exist)._

### 3. Start Development Servers

Start both the API and Web development servers in parallel using Turbo:

```bash
pnpm dev
```

This runs the development servers at:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:8000](http://localhost:8000)

---

## 🔑 Admin User Promotion

To promote an existing user to the `ADMIN` role:

### In Local Development

Run the promotion helper script from the root of the repository:

```bash
pnpm db:promote user@example.com
```

### In Production / Docker Deployment

Run the command inside the running API Docker container:

```bash
docker exec -it task-manager-api pnpm --filter api db:promote user@example.com
```

---

## 🏗️ Structure & Development

- **`apps/web`**: Next.js App router frontend using Tailwind CSS/PostCSS.
- **`apps/api`**: Express app using Drizzle ORM and Postgres database connection.
- **`packages/ui`**: Shared UI component library powered by shadcn/ui.
- **`packages/shared`**: Shared helper libraries and TypeScript interfaces.
- **`packages/eslint-config`** & **`packages/typescript-config`**: Monorepo configurations.

### Adding UI Components

To add UI components to your project, run the following command from the root pointing at your `web` app context:

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/web
```

This places the component in the shared `packages/ui/src/components` directory.

### Using UI Components

Import components directly from the shared ui workspace namespace:

```tsx
import { Button } from '@workspace/ui/components/button';
```

### Commands Reference

- **Build all workspaces**: `pnpm build`
- **Lint codebase**: `pnpm lint`
- **Format code**: `pnpm format`
- **Run type checks**: `pnpm typecheck`
- **Run tests**: `pnpm test`

---

## ⚙️ CI / GitHub Actions

A GitHub Actions workflow is configured at [`.github/workflows/ci.yml`](.github/workflows/ci.yml) and runs automatically on every push or pull request targeting `main` or `develop`.

### What it does

| Step                 | Command                          |
| -------------------- | -------------------------------- |
| Install dependencies | `pnpm install --frozen-lockfile` |
| Lint                 | `pnpm lint`                      |
| Typecheck            | `pnpm typecheck`                 |
| Tests                | `pnpm test`                      |

> Concurrent runs on the same branch are automatically cancelled to avoid wasting CI minutes.

---

## 🎯 Assumptions & Trade-offs

Here are key assumptions and technical trade-offs made in this project setup:

### 1. Storage Providers (Local vs Cloudflare R2)

- **Assumption**: Default file uploads are saved locally (`STORAGE_PROVIDER='local'`) in the `apps/api/uploads/` directory, which is also registered as a static directory serving static assets.
- **Trade-off**: Local file storage is simple to run locally but is not persistent on ephemeral hosting providers (like AWS ECS, Heroku, or serverless functions). In a production or distributed setup, `STORAGE_PROVIDER` should be set to `r2` using correct Cloudflare R2 API credentials to ensure high availability and persistence.
