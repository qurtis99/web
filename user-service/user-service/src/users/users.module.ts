import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersMessageController } from './users.message.controller';
import { User } from './user.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, UsersMessageController],
  providers: [UsersService],
})
export class UsersModule {}
