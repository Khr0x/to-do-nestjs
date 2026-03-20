import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const isProduction = process.env.NODE_ENV === 'production';
const extension = isProduction ? 'js' : 'ts';
const baseDir = isProduction ? 'dist' : 'src';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME?.toString(),
  password: process.env.DB_PASSWORD?.toString(),
  database: process.env.DB_NAME?.toString(),

  entities: [path.join(__dirname, `${baseDir}/**/*.entity.${extension}`)],
  migrations: [path.join(__dirname, `${baseDir}/database/migrations/*.${extension}`)],
});