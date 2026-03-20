import * as bcrypt from 'bcrypt';

/**
 * Genera un hash de una contraseña usando bcrypt
 * @param password - Contraseña en texto plano
 * @param saltRounds - Número de rondas para generar el salt (default: 10)
 * @returns Password hasheada
 */
export async function hashPassword(
  password: string,
  saltRounds: number = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS) : 10,
): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

/**
 * Compara una contraseña en texto plano con un hash
 * @param password - Contraseña en texto plano
 * @param hashedPassword - Password hasheada
 * @returns True si coinciden, false si no
 */
export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Genera un salt usando bcrypt
 * @param length - Longitud del salt
 * @returns Salt generado
 */
export async function genSalt(length: number): Promise<string> {
  return await bcrypt.genSalt(length);
}

/**
 * Genera un hash de un dato usando bcrypt
 * @param data - Dato a hashear
 * @param saltRounds - Número de rondas para generar el salt (default: 10)
 * @returns Dato hasheado
 */
export async function hash(data: string, saltRounds: number): Promise<string> {
  return await bcrypt.hash(data, saltRounds);
}