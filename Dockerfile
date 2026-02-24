# Single stage: use pre-built dist files
FROM node:20-alpine
WORKDIR /app

# Install server dependencies
COPY packages/server/package.json ./packages/server/
RUN cd packages/server && npm install --omit=dev

# Copy pre-built server
COPY packages/server/dist ./packages/server/dist

# Copy pre-built frontend
COPY packages/client/dist ./packages/client/dist

# Copy static assets (portraits, maps, etc.)
COPY packages/client/public ./packages/client/dist

# Copy root package.json
COPY package.json ./

# Create data directory
RUN mkdir -p data

ENV NODE_ENV=production
ENV PORT=46127
ENV DB_PATH=/app/data/htf.db
EXPOSE 46127

CMD ["node", "packages/server/dist/index.js"]
