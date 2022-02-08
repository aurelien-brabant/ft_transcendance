import { Request, UseGuards, Post, Controller, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {AuthService} from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  // use local passport strategy to protect this route
  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async loginUser(@Request() req: any) {
    return this.authService.generateJWT(req.user);
  }


  @UseGuards(JwtAuthGuard)
  @Get('/protected')
  async testProtectedRoute(@Request() req: any) {
    return req.user;
  }
}
