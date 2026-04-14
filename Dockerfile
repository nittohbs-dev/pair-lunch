# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts postcss.config.js tailwind.config.js eslint.config.js ./

# Copy environment files - IMPORTANT: must be before build
COPY .env.example .env

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY public ./public
COPY index.html ./

# Build frontend with environment variables
RUN npm run build


# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install production dependencies and http-server
COPY package*.json ./
RUN npm ci --only=production && npm install -g http-server

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy environment files and create .env from .env.example
COPY .env.example ./
RUN cp .env.example .env

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["http-server", "dist", "-p", "3000", "--cors", "--gzip"]
