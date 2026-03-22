import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envVarsSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TodoModule } from './modules/todo/todo.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CsrfGuard } from './common/guards/csrf.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      validationSchema: envVarsSchema,
      validationOptions: { 
        allowUnknown: true,
        abortEarly: true 
      },
    }),
    ThrottlerModule.forRoot({
     throttlers: [
      {
        ttl: 60000,
        limit: 100,
      }
     ]
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    TodoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
        provide: 'APP_GUARD',
        useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
