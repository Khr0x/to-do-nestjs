# 🐳 Guía Detallada de Docker

> **Nota:** Para inicio rápido, ver [README.md](README.md). Este documento contiene información detallada, comandos avanzados y troubleshooting completo.

## Requisitos Previos

### Para Docker:
- Docker Desktop instalado ([Descargar](https://www.docker.com/products/docker-desktop))

### Para desarrollo local (sin Docker):
- Node.js 20+ instalado
- PostgreSQL 16+ instalado y ejecutándose
- pnpm instalado (`npm install -g pnpm`)

---

## Configuración y Uso

### Opción 1: Con Docker

#### 1. Configuración inicial

```bash
# Crear archivo .env desde el ejemplo
cp .env.example .env
```

#### 2. Editar `.env` con estas variables importantes:

```env
# ⚠️ IMPORTANTE: Para Docker, DB_HOST debe ser 'postgres'
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=todo_db

JWT_SECRET=mi-secreto-jwt-muy-largo-y-seguro-cambiar-en-produccion
FRONTEND_URL=http://localhost:4200
```

#### 3. Ejecutar con Docker

```bash
# Iniciar todos los servicios (app + PostgreSQL)
docker-compose up

# O en modo background
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f app
```

**La aplicación estará disponible en: http://localhost:3000**

---

### Opción 2: Sin Docker (Local)

#### 1. Instalar y configurar PostgreSQL

```bash
# En macOS con Homebrew
brew install postgresql@16
brew services start postgresql@16

# Crear base de datos
createdb todo_db
```

#### 2. Configurar entorno

```bash
# Crear archivo .env
cp .env.example .env
```

Editar `.env`:

```env
# ⚠️ IMPORTANTE: Para local, DB_HOST debe ser 'localhost'
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu-password-local
DB_NAME=todo_db

JWT_SECRET=mi-secreto-jwt-muy-largo-y-seguro
FRONTEND_URL=http://localhost:4200
```

#### 3. Ejecutar la aplicación

```bash
# Instalar dependencias
pnpm install

# Ejecutar migraciones
pnpm run migration:run

# Iniciar en modo desarrollo
pnpm run start:dev
```

**La aplicación estará disponible en: http://localhost:3000**

---

## Comandos Avanzados

### Docker - Gestión de Servicios

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs solo de la app
docker-compose logs -f app

# Ver logs solo de postgres
docker-compose logs postgres

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir imágenes sin cache
docker-compose build --no-cache

# Reconstruir y reiniciar
docker-compose up --build
```

### Docker - Acceso a Contenedores

```bash
# Acceder al shell del contenedor de la app
docker-compose exec app sh

# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d todo_db

# Ejecutar comando en el contenedor
docker-compose exec app pnpm run migration:run
```

### Docker - Gestión de Volúmenes

```bash
# Listar volúmenes
docker volume ls

# Ver información del volumen de postgres
docker volume inspect to-do-nestjs_postgres_data

# Hacer backup de la base de datos
docker-compose exec postgres pg_dump -U postgres todo_db > backup.sql

# Restaurar backup
cat backup.sql | docker-compose exec -T postgres psql -U postgres todo_db
```

---

## Migraciones de Base de Datos

### Con Docker

```bash
# Ejecutar todas las migraciones pendientes
docker-compose exec app pnpm run migration:run

# Revertir la última migración
docker-compose exec app pnpm run migration:revert

# Generar nueva migración
docker-compose exec app pnpm run migration:generate -- NombreDeLaMigracion

# Ver estado de migraciones
docker-compose exec app pnpm run typeorm migration:show -d data-source.ts
```

### Sin Docker (Local)

```bash
# Ejecutar todas las migraciones pendientes
pnpm run migration:run

# Revertir la última migración
pnpm run migration:revert

# Generar nueva migración
pnpm run migration:generate NombreDeLaMigracion

# Ver estado de migraciones
pnpm run typeorm migration:show -d data-source.ts
```

---

## Solución de Problemas

### Error: "Cannot connect to database"

**Con Docker:**
1. Verifica que los contenedores estén corriendo:
   ```bash
   docker-compose ps
   ```
2. Asegúrate que en `.env` tienes: `DB_HOST=postgres`
3. Revisa los logs de postgres:
   ```bash
   docker-compose logs postgres
   ```

**Sin Docker:**
1. Verifica que PostgreSQL esté corriendo:
   ```bash
   brew services list
   ```
2. Asegúrate que en `.env` tienes: `DB_HOST=localhost`

### Error: "Port 3000 already in use"

```bash
# Cambiar el puerto en .env
PORT=3001

# O detener el proceso que usa el puerto
lsof -ti:3000 | xargs kill -9
```

### Error: "Migration failed"

```bash
# Con Docker - reiniciar desde cero
docker-compose down -v
docker-compose up

# Sin Docker - verificar conexión a BD
psql -U postgres -d todo_db -c "SELECT 1;"
```

### Reiniciar todo desde cero (Docker)

```bash
# Detener y eliminar todo
docker-compose down -v

# Reconstruir y reiniciar
docker-compose build --no-cache
docker-compose up
```
---

## Variables de Entorno

| Variable | Con Docker | Sin Docker | Descripción |
|----------|------------|------------|-------------|
| `DB_HOST` | `postgres` | `localhost` | Host de PostgreSQL |
| `DB_PORT` | `5432` | `5432` | Puerto de PostgreSQL |
| `DB_USERNAME` | `postgres` | `postgres` | Usuario de BD |
| `DB_PASSWORD` | Tu password | Tu password | Contraseña de BD |
| `DB_NAME` | `todo_db` | `todo_db` | Nombre de BD |
| `JWT_SECRET` | Mínimo 32 caracteres | Mínimo 32 caracteres | Secreto para JWT |
| `PORT` | `3000` | `3000` | Puerto de la app |
| `FRONTEND_URL` | `http://localhost:4200` | `http://localhost:4200` | URL del frontend |
| `BCRYPT_SALT_ROUNDS` | `10` | `10` | Rounds de bcrypt |
| `JWT_EXPIRATION` | `86400` | `86400` | Expiración JWT (segundos) |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | `7d` | Expiración refresh token |

**Importante:** La diferencia clave entre Docker y local es `DB_HOST`:
- **Docker:** `DB_HOST=postgres` (nombre del servicio en docker-compose)
- **Local:** `DB_HOST=localhost` (servidor PostgreSQL local)

## Arquitectura de Docker

### Servicios en docker-compose.yml

```yaml
services:
  postgres:
    - Base de datos PostgreSQL 16
    - Puerto: 5432
    - Volumen persistente: postgres_data
    - Healthcheck para garantizar disponibilidad
  
  app:
    - Aplicación NestJS
    - Puerto: 3000
    - Hot-reload habilitado (desarrollo)
    - Ejecuta migraciones automáticamente al iniciar
    - Depende de postgres (espera healthcheck)
```

### Dockerfile Multi-Stage

1. **Development Stage:**
   - Basado en Node 20 Alpine
   - Instala todas las dependencias
   - Monta código fuente como volumen
   - Hot-reload habilitado

2. **Build Stage:**
   - Compila TypeScript a JavaScript
   - Genera el directorio `dist/`

3. **Production Stage:**
   - Solo dependencias de producción
   - Usuario no-root por seguridad
   - Imagen optimizada y ligera

---

## Recursos Adicionales

- [NestJS Documentation](https://docs.nestjs.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [TypeORM Migrations](https://typeorm.io/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)m run migration:run
pnpm run start:dev
```
