# Stage 1: Build frontend + backend
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY packages/client/package.json packages/client/
COPY packages/server/package.json packages/server/

RUN npm install

COPY packages/client/ packages/client/
COPY packages/server/ packages/server/

RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Install server dependencies
COPY packages/server/package.json ./packages/server/
RUN cd packages/server && npm install --omit=dev

# Copy built server
COPY --from=builder /app/packages/server/dist ./packages/server/dist

# Copy built frontend
COPY --from=builder /app/packages/client/dist ./packages/client/dist

# Copy root package.json
COPY package.json ./

# Create data directory
RUN mkdir -p data

ENV NODE_ENV=production
ENV PORT=46127
ENV DB_PATH=/app/data/htf.db
EXPOSE 46127

CMD ["node", "packages/server/dist/index.js"]
