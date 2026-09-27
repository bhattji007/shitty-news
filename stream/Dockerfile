# Long-running NewsData.io WebSocket consumer. Not for Cloudflare Workers.
FROM node:24-alpine
WORKDIR /app
# Shared normaliser/blocklist live in the repo's src/lib/news; copy just those.
COPY stream/package.json ./stream/
RUN cd stream && npm install --omit=dev --no-audit --no-fund
COPY src/lib/news ./src/lib/news
COPY stream/index.ts ./stream/
ENV NODE_ENV=production
USER node
CMD ["node", "stream/index.ts"]
