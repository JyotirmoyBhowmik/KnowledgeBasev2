FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/antigravity/package*.json ./apps/antigravity/
COPY packages/db/package*.json ./packages/db/
COPY apps/backend/package*.json ./apps/backend/
RUN npm install --legacy-peer-deps
COPY . .
RUN cd apps/antigravity && npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN mkdir -p /app/apps/antigravity/public
COPY --from=builder /app/apps/antigravity/.next ./apps/antigravity/.next
COPY --from=builder /app/apps/antigravity/public* ./apps/antigravity/public/
COPY --from=builder /app/apps/antigravity/package*.json ./apps/antigravity/
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# Also copy workspace node_modules in case next was not hoisted
COPY --from=builder /app/apps/antigravity/node_modules ./apps/antigravity/node_modules
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=apps/antigravity"]
