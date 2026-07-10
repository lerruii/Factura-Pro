# FacturaPro SaaS — imagen de producción
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY public ./public

# los datos (SQLite) viven en /app/data: monta ahí el volumen persistente
# del hosting (en Railway: Attach Volume con mount path /app/data)

EXPOSE 3000
CMD ["node", "server/index.js"]
