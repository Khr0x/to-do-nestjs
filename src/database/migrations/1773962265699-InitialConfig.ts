import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialConfig1773962265699 implements MigrationInterface {
    name = 'InitialConfig1773962265699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear el tipo ENUM primero
        await queryRunner.query(`CREATE TYPE "public"."todos_prioridad_enum" AS ENUM('baja', 'media', 'alta')`);
        
        // Crear extensión uuid si no existe
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        
        // Crear tabla users
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(255) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "activo" boolean NOT NULL DEFAULT true, "ultimoLogin" TIMESTAMP, "fechaCreacion" TIMESTAMP NOT NULL DEFAULT now(), "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT now(), "fechaEliminacion" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        
        // Crear tabla todos
        await queryRunner.query(`CREATE TABLE "todos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(255) NOT NULL, "prioridad" "public"."todos_prioridad_enum" NOT NULL DEFAULT 'media', "finalizada" boolean NOT NULL DEFAULT false, "userId" uuid NOT NULL, "fechaCreacion" TIMESTAMP NOT NULL DEFAULT now(), "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT now(), "fechaEliminacion" TIMESTAMP, CONSTRAINT "PK_ca8cafd59ca6faaf67995344225" PRIMARY KEY ("id"))`);
        
        // Crear foreign key
        await queryRunner.query(`ALTER TABLE "todos" ADD CONSTRAINT "FK_4583be7753873b4ead956f040e3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign key
        await queryRunner.query(`ALTER TABLE "todos" DROP CONSTRAINT "FK_4583be7753873b4ead956f040e3"`);
        
        // Eliminar tablas
        await queryRunner.query(`DROP TABLE "todos"`);
        await queryRunner.query(`DROP TABLE "users"`);
        
        // Eliminar tipo enum
        await queryRunner.query(`DROP TYPE "public"."todos_prioridad_enum"`);
    }

}
