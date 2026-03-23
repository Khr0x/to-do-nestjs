# To-Do NestJS API

API REST backend construida con NestJS para aplicación de gestión de tareas.

## Requisitos Previos

### Para ejecutar con Docker:
- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado

### Para ejecutar localmente (sin Docker):
- Node.js 20+
- PostgreSQL 16+
- pnpm (`npm install -g pnpm`)

## Inicio Rápido

### Con Docker (Recomendado)

```bash
# 1. Crear archivo de entorno
cp .env.example .env

# 2. Editar .env y cambiar DB_HOST=postgres
#    (importante para Docker)

# 3. Iniciar con Docker
docker compose up
```

Aplicación disponible en: **http://localhost:3000**

### Sin Docker (Desarrollo Local)

```bash
# 1. Instalar PostgreSQL y crear la base de datos
brew install postgresql@16
brew services start postgresql@16
createdb todo_db

# 2. Crear archivo de entorno
cp .env.example .env

# 3. Editar .env y cambiar DB_HOST=localhost
#    (importante para local)

# 4. Instalar dependencias
pnpm install

# 5. Ejecutar migraciones
pnpm run migration:run

# 6. Iniciar aplicación
pnpm run start:dev
```

🎉 Aplicación disponible en: **http://localhost:3000**

## 🔧 Comandos Útiles

### Con Docker:
```bash
# Iniciar servicios
docker-compose up

# Iniciar en background
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose up --build

# Acceder al contenedor
docker-compose exec app sh

# Ejecutar migraciones
docker-compose exec app pnpm run migration:run
```

### Sin Docker:
```bash
# Modo desarrollo (con hot-reload)
pnpm run start:dev

# Modo debug
pnpm run start:debug

# Ejecutar migraciones
pnpm run migration:run

# Generar migración
pnpm run migration:generate NombreMigracion

# Revertir migración
pnpm run migration:revert

# Ejecutar tests
pnpm run test

# Build para producción
pnpm run build
pnpm run start:prod
```

## Variables de Entorno

Crea tu archivo `.env` desde `.env.example` y configura estas variables:

| Variable | Docker | Local | Descripción |
|----------|--------|-------|-------------|
| `DB_HOST` | `postgres` | `localhost` | Host de PostgreSQL |
| `DB_PORT` | `5432` | `5432` | Puerto de PostgreSQL |
| `DB_USERNAME` | `postgres` | `postgres` | Usuario de BD |
| `DB_PASSWORD` | Tu password | Tu password | Contraseña de BD |
| `DB_NAME` | `todo_db` | `todo_db` | Nombre de BD |
| `JWT_SECRET` | Mínimo 32 caracteres | Mínimo 32 caracteres | Secreto para JWT |
| `PORT` | `3000` | `3000` | Puerto de la app |
| `FRONTEND_URL` | `http://localhost:4200` | `http://localhost:4200` | URL del frontend |

**Importante:** La única diferencia entre Docker y local es `DB_HOST`:
- Docker: `DB_HOST=postgres`
- Local: `DB_HOST=localhost`

## Solución de Problemas

### Error: "Cannot connect to database"
- **Docker:** Verifica que `DB_HOST=postgres` en tu `.env`
- **Local:** Verifica que `DB_HOST=localhost` y que PostgreSQL esté ejecutándose

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto en .env
PORT=3001

# O liberar el puerto
lsof -ti:3000 | xargs kill -9
```

### Error: "Migration failed"
```bash
# Docker: reiniciar desde cero
docker-compose down -v
docker-compose up

# Local: verificar conexión
psql -U postgres -d todo_db -c "SELECT 1;"
```
**Para troubleshooting detallado, ver [DOCKER.md](DOCKER.md)**

---

## Arquitectura

### ¿Por qué NestJS?

NestJS es un framework progresivo de Node.js utilizado para construir aplicaciones del lado del servidor eficientes, confiables y escalables. Combina elementos de Programación Orientada a Objetos (OOP), Programación Funcional (FP) y Programación Reactiva Funcional (FRP).

**Razones principales para elegir NestJS:**

1. **Arquitectura Modular**: NestJS utiliza una estructura modular que organiza el código en bloques funcionales cohesivos. Cada módulo encapsula componentes relacionados (controladores, servicios, proveedores), lo que hace que el código sea altamente mantenible y escalable.

2. **TypeScript Primero**: Construido con TypeScript desde el principio, proporcionando seguridad de tipos completa y características modernas de ES6+.

3. **Inyección de Dependencias**: NestJS tiene un potente sistema de inyección de dependencias que mejora la organización del código y la testabilidad.

4. **Soporte Integrado para Open APIs**: Fácil integración con Swagger/OpenAPI para documentación de APIs.

5. **Soporte de Middleware**: Soporte listo para usar para middleware, guards, interceptores y filtros.

6. **Integración con Bases de Datos**: Integración seamless con TypeORM, Prisma y otros ORMs a través de módulos dedicados.

### Estructura del Proyecto

```
src/
├── app.module.ts              # Módulo raíz de la aplicación
├── app.controller.ts          # Controlador principal
├── app.service.ts             # Servicio principal
├── main.ts                    # Punto de entrada de la aplicación
│
├── config/                    # Configuración de la aplicación
│   └── env.validation.ts      # Validación de variables de entorno (Joi)
│
├── common/                    # Recursos compartidos
│   ├── guards/                # Guards de autenticación
│   │   ├── jwt-auth.guard.ts  # Guard para JWT
│   │   ├── local-auth.guard.ts # Guard para login
│   │   └── csrf.guard.ts      # Guard CSRF
│   └── utils/                 # Utilidades
│       └── hash.util.ts       # Utilidades de hash (bcrypt)
│
├── database/                  # Gestión de base de datos
│   ├── database.module.ts     # Módulo de TypeORM
│   └── migrations/            # Migraciones de base de datos
│       ├── 1773962265699-InitialConfig.ts
│       └── 1773968066323-RefreshToken.ts
│
└── modules/                   # Módulos de características
    │
    ├── auth/                  # Autenticación y autorización
    │   ├── auth.controller.ts # Endpoints de auth
    │   ├── auth.service.ts    # Lógica de autenticación
    │   ├── auth.module.ts     # Módulo de auth
    │   ├── dtos/              # DTOs de auth
    │   │   ├── login.dto.ts
    │   │   ├── auth-response.dto.ts
    │   │   └── refresh-token.dto.ts
    │   ├── entities/          # Entidades
    │   │   └── refresh-token.entity.ts
    │   ├── strategies/        # Estrategias Passport
    │   │   ├── jwt.strategy.ts
    │   │   └── local.strategy.ts
    │   └── refresh-token/     # Módulo de refresh tokens
    │       ├── refresh-token.service.ts
    │       ├── refresh-token.module.ts
    │       ├── refresh-token.providers.ts
    │       └── mappers/
    │           └── refresh-token.mapper.ts
    │
    ├── user/                  # Gestión de usuarios
    │   ├── user.service.ts    # Lógica de usuarios
    │   ├── user.module.ts     # Módulo de usuarios
    │   ├── user.provider.ts   # Providers
    │   ├── dtos/              # DTOs de usuario
    │   │   ├── create-user.dto.ts
    │   │   └── user.dto.ts
    │   ├── entities/          # Entidad de usuario
    │   │   └── user.entity.ts
    │   └── mappers/           # Mappers
    │       └── user.mapper.ts
    │
    └── todo/                  # Gestión de tareas
        ├── todo.controller.ts # Endpoints de tareas
        ├── todo.service.ts    # Lógica de tareas
        ├── todo.module.ts     # Módulo de tareas
        ├── dtos/              # DTOs de tareas
        │   ├── create-todo.dto.ts
        │   ├── update-todo.dto.ts
        │   ├── pagination-todo.dto.ts
        │   └── todo.dto.ts
        ├── entities/          # Entidad de tarea
        │   └── todo.entity.ts
        └── mappers/           # Mappers
            └── todo.mapper.ts
```

### Patrones de Diseño Utilizados

- **Patrón Módulo**: Cada característica está encapsulada en su propio módulo
- **Patrón Repositorio**: Abstracción de acceso a datos a través de repositorios TypeORM
- **Patrón Fábrica**: Registro del módulo JWT con ConfigService
- **Patrón Estrategia**: Autenticación mediante estrategias Passport

---

## Sistema de Autenticación

El sistema de autenticación utiliza un **enfoque de doble estrategia** con Passport.js:

### 1. LocalStrategy

Utilizada para autenticación con usuario/contraseña (flujo de login).

```typescript
// src/modules/auth/strategies/local.strategy.ts
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ 
        usernameField: 'email'  // Usar email como nombre de usuario
    });
  }

  async validate(email: string, pass: string): Promise<any> {
    const user = await this.authService.validateCredentials(email, pass);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }
}
```

**Cómo funciona:**
1. Recibe email y contraseña del request de login
2. Llama a `AuthService.validateCredentials()` para verificar credenciales
3. Retorna el objeto de usuario si es válido, lanza `UnauthorizedException` si no lo es

### 2. JWT Strategy

Utilizada para proteger rutas después de la autenticación inicial. Extrae el JWT de:
- Header de Authorization (Bearer token)
- Cookies (`access_token` cookie)

```typescript
// src/modules/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: JwtStrategy.extractJWT,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  private static extractJWT(req: Request): string | null {
    // Prioridad 1: Bearer token en header Authorization
    const tokenFromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (tokenFromHeader) {
      return tokenFromHeader; 
    }

    // Prioridad 2: Cookie access_token
    if (req.cookies && 'access_token' in req.cookies) {
      return req.cookies.access_token;
    }

    return null;
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}
```

**Cómo funciona:**
1. Extrae el token JWT del request (header o cookie)
2. Verifica la firma del token usando `JWT_SECRET`
3. Verifica la expiración del token
4. Retorna el payload del usuario (id, email, name) para acceso a la ruta

### Flujo de Autenticación

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Cliente   │────▶│  Auth Controller │────▶│  LocalStrategy  │
│ (Frontend)  │     │   /v1/auth/login │     │ (Credenciales)  │
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │                         │
                           ▼                         ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │   JWT Token      │◀────│  AuthService    │
                    │   + Refresh      │     │ (validar cred)  │
                    └──────────────────┘     └─────────────────┘
                           │
                           ▼
                    ┌──────────────────┐
                    │ Establecer       │
                    │ HTTP-Only        │
                    │ Cookies          │
                    └──────────────────┘
```

### Rutas Protegidas

Después del login, los endpoints protegidos requieren autenticación JWT:

```typescript
// Ejemplo de ruta protegida
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Req() req) {
  return req.user;
}
```

### Configuración de Tokens

| Token | Expiración | Almacenamiento |
|-------|------------|-----------------|
| Access Token | 24 horas (configurable) | Cookie HTTP-Only |
| Refresh Token | 7 días | Cookie HTTP-Only |

---

## Endpoints de API

### Autenticación (`/v1/auth`)

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| POST | `/v1/auth/login` | Login de usuario | No (LocalStrategy) |
| POST | `/v1/auth/register` | Registro de usuario | No |
| POST | `/v1/auth/refresh` | Renovar token de acceso | Sí (JWT) |
| POST | `/v1/auth/logout` | Cerrar sesión | Sí (JWT) |

**Detalles:**
- Los tokens se envían automáticamente en cookies HTTP-Only
- Login y register retornan `true` en caso de éxito
- Refresh usa el refresh_token de la cookie automáticamente

### Tareas (`/v1/todo`)

**Nota:** Todos los endpoints de tareas requieren autenticación JWT.

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| POST | `/v1/todo/create` | Crear nueva tarea | Body: `CreateTodoDto` |
| GET | `/v1/todo/list` | Listar todas las tareas del usuario | Query: `page`, `limit`, `prioridad`, `finalizada` |
| GET | `/v1/todo/list/:id` | Obtener una tarea específica | Param: `id` (UUID) |
| PATCH | `/v1/todo/update/:id` | Actualizar una tarea | Param: `id`, Body: `UpdateTodoDto` |
| DELETE | `/v1/todo/list/:id` | Eliminar una tarea | Param: `id` (UUID) |

**Ejemplo de query params para paginación:**
```
GET /v1/todo/list?page=1&limit=10&prioridad=alta&finalizada=false
```

---

## Stack Tecnológico

- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL con TypeORM
- **Autenticación**: Passport.js (JWT + Local)
- **Hash de Contraseñas**: bcrypt
- **Validación**: class-validator + Joi
- **Gestor de Paquetes**: pnpm
