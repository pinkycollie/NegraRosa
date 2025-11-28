# NegraRosa - Multi-stage Docker Build
# Optimized for MBTQ ecosystem with DeafAUTH accessibility support

# ==================== Build Stage ====================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ==================== Production Stage ====================
FROM node:20-alpine AS production

# Add labels for container metadata
LABEL org.opencontainers.image.title="NegraRosa"
LABEL org.opencontainers.image.description="MBTQ Security Platform with DeafAUTH Accessibility"
LABEL org.opencontainers.image.source="https://github.com/pinkycollie/NegraRosa"
LABEL org.opencontainers.image.licenses="MIT"

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copy necessary configuration files
COPY drizzle.config.ts ./
COPY tsconfig.json ./

# Create data directory for local storage
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 5000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/v1/deafauth/status || exit 1

# Start the application
CMD ["node", "dist/index.js"]
