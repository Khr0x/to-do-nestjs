/**
 * Configuración base para cookies de autenticación
 */
export interface CookieOptions {
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  maxAge: number;
}

/**
 * Cookies de autenticación generadas tras el login
 */
export interface AuthCookies {
  access: CookieOptions;
  refresh: CookieOptions;
}

/**
 * Respuesta de autenticación con tokens y cookies
 * Modelo/Interface estándar para el cliente (Angular/frontend)
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  cookies: AuthCookies;
}
