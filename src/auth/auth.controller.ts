import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dtos/login.dto';
import { User } from 'src/users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body(new ValidationPipe()) user: User) {
    return this.authService.signUp(user);
  }

  @Post('login')
  login(@Body(new ValidationPipe()) loginDto: LoginDTO) {
    return this.authService.login(loginDto);
  }
}
