FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy root monorepo configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages

# Copy apps/api source
COPY apps/api ./apps/api

# Install dependencies for api and workspace dependencies
RUN pnpm install --frozen-lockfile --filter api...

# Build the API
RUN pnpm --filter api build

EXPOSE 8000

# Run database migrations and start server
CMD ["sh", "-c", "pnpm --filter api db:migrate && pnpm --filter api start"]
