import { Request, UseGuards, Post, Controller } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {

  // use local passport strategy to protect this route
  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async loginUser(@Request() req: any) {
    return req.user;
  }
}
