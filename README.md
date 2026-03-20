# To-Do NestJS API

API REST backend construida con NestJS para aplicación de gestión de tareas.

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
├── app.module.ts           # Módulo raíz de la aplicación
├── main.ts                 # Punto de entrada de la aplicación
├── config/                 # Archivos de configuración
│   └── env.validation.ts   # Validación de variables de entorno (Joi)
├── common/                 # Recursos compartidos (guards, decoradores, etc.)
├── database/               # Configuración de base de datos y migraciones
│   ├── database.module.ts  # Módulo de base de datos TypeORM
│   └── migrations/         # Migraciones de base de datos
└── modules/                # Módulos de características
    ├── auth/               # Módulo de autenticación
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── auth.module.ts
    │   ├── dtos/           # Objetos de Transferencia de Datos
    │   ├── strategies/    # Estrategias de Passport
    │   └── refresh-token/  # Gestión de tokens de actualización
    ├── user/               # Módulo de gestión de usuarios
    └── todo/              # Módulo de tareas To-Do
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
2. Llama a [`AuthService.validateCredentials()`](src/modules/auth/auth.service.ts:61) para verificar credenciales
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

## Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```env
# APP CONFIG
NODE_ENV=development
PORT=3000

# DATABASE CONFIG
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# AUTH CONFIG
JWT_SECRET=tu-clave-secreta
JWT_EXPIRATION=24h
BCRYPT_SALT_ROUNDS=10
```

---

## Primeros Pasos

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run start:dev

# Construir para producción
npm run build
```

---

## Endpoints de API

### Autenticación (`/v1/auth`)

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| POST | `/v1/auth/login` | Login de usuario | No (LocalStrategy) |
| POST | `/v1/auth/register` | Registro de usuario | No |
| POST | `/v1/auth/refresh` | Renovar token de acceso | Sí (JWT) |
| POST | `/v1/auth/logout` | Cerrar sesión | Sí (JWT) |

---

## Stack Tecnológico

- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL con TypeORM
- **Autenticación**: Passport.js (JWT + Local)
- **Hash de Contraseñas**: bcrypt
- **Validación**: class-validator + Joi
- **Gestor de Paquetes**: pnpm
