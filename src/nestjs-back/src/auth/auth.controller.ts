import { Request, Body, UseGuards, Post, Controller, Get, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {AuthService} from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Login42Dto } from './dto/login-42.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  /* GET profile of the currenty logged user */
  @UseGuards(JwtAuthGuard)
  @Get('/login')
  async getUserProfile(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.id);

    if (!user) {
      throw new NotFoundException;
    }

    return user;
  }

  // use local passport strategy to protect this route
  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async loginUser(@Request() req: any) {
    return this.authService.generateJWT(req.user);
  }

  @Post('/login42')
  async loginDuoQuadra(@Body() login42Dto: Login42Dto) {
    const accessToken = await this.authService.loginDuoQuadra(login42Dto.apiCode);

    if (!accessToken) {
      throw new UnauthorizedException;
    }

    return { access_token: accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/protected')
  async testProtectedRoute(@Request() req: any) {
    return req.user;
  }
}
