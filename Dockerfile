# Stage 1: Build Frontend with Node 22 (required by pdfjs-dist & camera-controls, with Debian glibc for native binaries)
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Allocate 3.5GB memory for Vite bundler (safe for Cloud Build standard VM)
ENV NODE_OPTIONS="--max-old-space-size=3584"

# Build arguments for frontend environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_APP_ENV=production

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_APP_ENV=$VITE_APP_ENV

# Install build dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --no-audit

# Copy source code and ensure env exists for build
COPY . .
RUN if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env; fi
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine

# Copy custom Nginx configuration with SPA support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run injects the PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

# Dynamically substitute PORT if Cloud Run specifies a custom port
CMD sh -c "sed -i 's/listen 8080;/listen '${PORT:-8080}';/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
