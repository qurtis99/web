import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RpcException } from '@nestjs/microservices';

@Controller()
export class UsersMessageController {
  private readonly logger = new Logger(UsersMessageController.name);

  constructor(private readonly usersService: UsersService) {
    this.logger.log('UsersMessageController initialized');
    this.logger.log('Registered patterns: create_user, login_user');
  }

  @MessagePattern('create_user')
  async createUser(@Payload() createUserDto: CreateUserDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`Processing create_user: ${JSON.stringify(createUserDto)}`);
    try {
      const result = await this.usersService.createUser(createUserDto);
      this.logger.log('create_user response:', result);
      channel.ack(originalMsg); 
      return { id: result.id, email: result.email };
    } catch (error) {
      this.logger.error(`create_user error: ${error.message}`);
      channel.ack(originalMsg); 
      throw new RpcException(error.message || 'Failed to create user');
    }
  }

  @MessagePattern('login_user')
  async login(@Payload() loginUserDto: LoginUserDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(` Processing login_user: ${JSON.stringify(loginUserDto)}`);
    try {
      const result = await this.usersService.login(loginUserDto);
      this.logger.log(' login_user response:', result);
      channel.ack(originalMsg); 
      return result;
    } catch (error) {
      this.logger.error(`login_user error: ${error.message}`);
      channel.ack(originalMsg); 
      throw new RpcException(error.message || 'Failed to login');
    }
  }
}