import { Request, Body, UseGuards, Post, Controller, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {AuthService} from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Login42Dto } from './dto/login-42.dto';

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

  @Post('/login42')
  async loginDuoQuadra(@Body() login42Dto: Login42Dto) {
    console.log(login42Dto);
    this.authService.loginDuoQuadra(login42Dto.apiCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/protected')
  async testProtectedRoute(@Request() req: any) {
    return req.user;
  }
}
