# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy all source files (excluding those in .dockerignore)
COPY . .

# Install dependencies for the monorepo workspace
RUN pnpm install --frozen-lockfile

# Build the web application
# Next.js reads apps/web/.env natively at build time (NEXT_PUBLIC_* vars get baked in)
RUN pnpm --filter web build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy assets and standalone server output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Expose Next.js default port
EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "apps/web/server.js"]