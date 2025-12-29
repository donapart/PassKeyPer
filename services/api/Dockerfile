# PassKeyPer API Service
# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/api/package*.json ./services/api/
COPY packages/core/package*.json ./packages/core/
COPY packages/sync/package*.json ./packages/sync/
COPY packages/totp/package*.json ./packages/totp/

# Install dependencies
RUN npm ci --workspace=@passkeyper/core --workspace=@passkeyper/sync --workspace=@passkeyper/totp --workspace=@passkeyper/api

# Copy source code
COPY packages/ ./packages/
COPY services/api/ ./services/api/

# Generate Prisma client
WORKDIR /app/services/api
RUN npx prisma generate

# Build packages
WORKDIR /app
RUN npm run build --workspace=@passkeyper/core --workspace=@passkeyper/sync --workspace=@passkeyper/totp --if-present

# Build API
WORKDIR /app/services/api
RUN npm run build --if-present

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S passkeyper -u 1001

# Copy built application
COPY --from=builder --chown=passkeyper:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=passkeyper:nodejs /app/services/api ./services/api
COPY --from=builder --chown=passkeyper:nodejs /app/packages ./packages

WORKDIR /app/services/api

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Switch to non-root user
USER passkeyper

# Start with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
