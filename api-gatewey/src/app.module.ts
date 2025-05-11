import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserProxyModule } from './user-proxy/user-proxy.module'; 
import { UsersController } from './users/users.controller'; 

@Module({
  imports: [UserProxyModule],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
