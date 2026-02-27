# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy .env file for build stage (if needed for Prisma)
COPY .env* ./

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and config files
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# Build the application
RUN npm run build

# Verify build output
RUN ls -la dist/ && test -f dist/src/main.js

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install dependencies (including prisma and tsx for migrations and seeding)
COPY package.json package-lock.json* ./
RUN npm install && \
    npm install tsx && \
    npm cache clean --force

# Copy Prisma schema and migrations
COPY prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy assets and i18n directories if they exist
COPY --from=builder /app/src/assets/ ./src/assets/
COPY --from=builder /app/src/i18n/ ./src/i18n/

# Copy .env file for production stage
COPY --from=builder /app/.env* ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nestjs -G nodejs && \
    chown -R nestjs:nodejs /app

USER nestjs

# Expose port (will be overridden by PORT env var, default 3000)
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8081/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Run migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]