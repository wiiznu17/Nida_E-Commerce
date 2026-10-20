# Stage 1: Base Alpine Image
FROM node:24-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# Stage 2: Prune Monorepo for 'admin-api' workspace
FROM base AS pruner
RUN npm install -g turbo
COPY . .
RUN turbo prune admin-api --docker

# Stage 3: Builder Stage
FROM base AS builder
# Install dependencies based on pruned manifests for optimal Docker layer caching
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/package-lock.json ./package-lock.json
RUN npm ci --engine-strict=false

# Copy full source of pruned workspaces
COPY --from=pruner /app/out/full/ .

# Generate Prisma Client for Alpine
RUN npm --prefix packages/database run db:generate

# Build internal shared packages and target Admin API
RUN npm --prefix packages/types run build && \
    npm --prefix packages/validators run build && \
    npm --prefix apps/admin-api run build

# Stage 4: Production Runner Stage
FROM node:24-alpine AS runner
RUN apk add --no-cache dumb-init
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Run as non-root user for security
USER node

# Copy node_modules and built artifacts
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/packages ./packages
COPY --chown=node:node --from=builder /app/apps/admin-api/dist ./apps/admin-api/dist
COPY --chown=node:node --from=builder /app/apps/admin-api/package.json ./apps/admin-api/package.json

EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/admin-api/dist/main.js"]
