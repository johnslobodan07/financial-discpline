# multi-stage Dockerfile for a Node.js backend
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy source (do this after deps to leverage cache)
COPY . .

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5700

# Copy app and production deps from builder
COPY --from=builder /app ./
RUN npm prune --production --silent

# Create non-root user and switch
RUN addgroup -S app && adduser -S -G app app
USER app

EXPOSE 5700
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost:${PORT}/health || exit 1

# Start app (expects a "start" script in package.json)
CMD ["npm", "start"]