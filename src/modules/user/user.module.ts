import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseModule } from "src/database/database.module";
import { User } from "./entities/user.entity";
import { userProviders } from "./user.provider";
import { UsersService } from "./user.service";

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [
    ...userProviders,
    UsersService,
  ],
  exports: [UsersService]
})
export class UsersModule {}