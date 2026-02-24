FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json ./
COPY packages/client/package.json packages/client/
COPY packages/server/package.json packages/server/

RUN npm install

COPY packages/client/ packages/client/
COPY packages/server/ packages/server/

RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/packages/client/dist ./packages/client/dist
COPY --from=builder /app/package.json ./

RUN cd packages/server && npm install --production

ENV NODE_ENV=production
ENV PORT=46127
EXPOSE 46127

CMD ["node", "packages/server/dist/index.js"]
