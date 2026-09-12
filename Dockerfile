# Multi-stage build for HE-SARMS
FROM node:20-alpine AS builder

WORKDIR /app

# Build Client
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client/ ./client/
RUN cd client && npm run build

# Install Server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Production image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY server/ ./server/

EXPOSE 5000

CMD ["node", "server/src/server.js"]

