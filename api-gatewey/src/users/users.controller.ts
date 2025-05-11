import {
    Controller,
    Post,
    Body,
    BadRequestException,
    InternalServerErrorException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { UserProxyService } from '../user-proxy/user-proxy.service';
  import { lastValueFrom, timeout, retry } from 'rxjs';
  import { CreateUserDto } from './dto/create-user.dto';
  
  @Controller('users')
  export class UsersController {
    constructor(private readonly userProxyService: UserProxyService) {}
  
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
      console.log('Sending registration:', createUserDto);
      const client = this.userProxyService.getClient();
      try {
        const response$ = client.send('create_user', createUserDto).pipe(
          timeout(10000),
          retry({ count: 2, delay: 500 })
        );
        const result = await lastValueFrom(response$);
        console.log('Registration response:', result);
        return result;
      } catch (error) {
        console.error(' Registration error:', error);
        if (error?.error === 'User already exists') {
          throw new BadRequestException('User already exists');
        }
        if (error.message === 'There is no matching message handler defined in the remote service.') {
          throw new InternalServerErrorException('User Service is not responding');
        }
        throw new InternalServerErrorException(`Registration failed: ${JSON.stringify(error)}`);
      }
    }
  
    @Post('login')
    async login(@Body() loginDto: { email: string; password: string }) {
      if (!loginDto.email || !loginDto.password) {
        throw new BadRequestException('Missing email or password');
      }
  
      console.log('Sending login:', loginDto);
      const client = this.userProxyService.getClient();
      try {
        const response$ = client.send('login_user', loginDto).pipe(
          timeout(10000),
          retry({ count: 2, delay: 500 })
        );
        const result = await lastValueFrom(response$);
        console.log('Login response:', result);
        return result;
      } catch (error) {
        console.error('Login error:', error);
        if (error?.error === 'Invalid credentials') {
          throw new UnauthorizedException('Invalid credentials');
        }
        if (error.message === 'There is no matching message handler defined in the remote service.') {
          throw new InternalServerErrorException('User Service is not responding');
        }
        throw new InternalServerErrorException(`Login failed: ${JSON.stringify(error)}`);
      }
    }
  }
