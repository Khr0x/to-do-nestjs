FROM node:20-alpine AS development

# Instalar pnpm
RUN npm install -g pnpm

# Crear directorio de la app
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando por defecto en desarrollo
CMD ["pnpm", "run", "start:dev"]


FROM node:20-alpine AS build

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar todas las dependencias
RUN pnpm install

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN pnpm run build


# ===================
# Production Stage
# ===================
FROM node:20-alpine AS production

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar solo dependencias de producción
RUN pnpm install --prod

# Copiar archivos compilados desde build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/data-source.ts ./data-source.ts

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Cambiar permisos
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["node", "dist/main"]
