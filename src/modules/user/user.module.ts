import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { userProviders } from "./user.provider";
import { UsersService } from "./user.service";

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [
    ...userProviders,
    UsersService,
  ],
  exports: [UsersService]
})
export class UsersModule {}