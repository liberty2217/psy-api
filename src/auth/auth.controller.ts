import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dtos/login.dto';
import { User } from 'src/users/schemas/user.schema';
import { JwtAuthGuard } from './jwt-auth.guard';

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

  @Post('refresh')
  refresh(@Body() { refreshToken }: { refreshToken: string }) {
    console.log('refreshToken', refreshToken);
    return this.authService.refresh(refreshToken);
  }

  @Get('confirmEmail/:token')
  confirmEmail(@Param('token') token: string) {
    return this.authService.confirmEmail(token);
  }

  @Post('logout')
  async logout(@Body() body: { refreshToken: string }) {
    await this.authService.logout(body.refreshToken);
    return { message: 'Logged out successfully' };
  }
}
