import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [UsersModule, TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'transcendance',
      password: 'transcendance',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true,         //disable it in production
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
