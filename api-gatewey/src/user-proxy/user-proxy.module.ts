import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserProxyService } from './user-proxy.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'user_queue',
          queueOptions: {
            durable: true,
          },
          noAck: false,
          prefetchCount: 10,
          socketOptions: {
            reconnectTimeInSeconds: 5,
            heartbeatIntervalInSeconds: 10,
            connectionTimeout: 10000,
          },
        },
      },
    ]),
  ],
  providers: [UserProxyService],
  exports: [UserProxyService],
})
export class UserProxyModule {}
