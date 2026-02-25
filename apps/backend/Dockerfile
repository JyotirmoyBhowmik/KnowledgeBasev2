FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/db/package*.json ./packages/db/
RUN npm ci --workspace=apps/backend --workspace=packages/db
COPY packages/db ./packages/db
COPY apps/backend ./apps/backend
RUN cd packages/db && npx prisma generate
RUN cd apps/backend && npx nest build

FROM node:20-alpine AS runner
WORKDIR /app
RUN mkdir -p /var/lib/kb/pdfs /var/lib/kb/videos
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db ./packages/db
EXPOSE 4000
CMD ["node", "dist/main"]
