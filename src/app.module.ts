import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailService } from './mail/mail.service';

const DATABASE_URL = process.env.DATABASE_URL;

@Module({
  imports: [MongooseModule.forRoot(DATABASE_URL), UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
