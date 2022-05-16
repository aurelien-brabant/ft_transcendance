import {
  Request,
  Body,
  UseGuards,
  Post,
  Controller,
  Get,
  UnauthorizedException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { Login42Dto } from './dto/login-42.dto';
import { UsersService } from '../users/users.service';
import { LoginTfaDto } from './dto/login-tfa.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /* GET profile of the currenty logged user */
  @UseGuards(JwtAuthGuard)
  @Get('/login')
  async getUserProfile(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.id);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async loginUser(@Request() req: any, @Res() res: Response) {
    const { user } = req;

    /*
     * if TFA is enabled, generate a TFA request that will allow the user to actually login
     * using the /validate-tfa endpoint for a limited amount of time.
     */
    if (user.tfa) {
      await this.usersService.generateTfaRequestForNow(user.id);

      return res.status(401).json({
        error: 'TFA_REQUIRED',
        userId: user.id,
        message:
          'Two factor authentication has been enabled on that account. You are now able to verify your login action by sending the appropriate code.',
      });
    }

    const authCookie = await this.authService.getCookieWithJwtToken(user.id);

    res.setHeader('Set-Cookie', authCookie);
    return res.send(user);
  }

  @Post('/login-tfa')
  async loginTfa(@Body() { userId }: LoginTfaDto, @Res() res: Response) {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    const hasOnGoingTfaRequest = await this.usersService.hasOnGoingTfaRequest(
      userId,
    );

    if (!hasOnGoingTfaRequest) {
      throw new UnauthorizedException(
        'There is no ongoing tfa request for that user',
      );
    }

    const canLogin = user.hasTfaBeenValidated;

    if (!canLogin) {
      throw new UnauthorizedException(
        "Ongoing tfa request hasn't  been validated",
      );
    }
    await this.usersService.invalidateTfaRequest(userId);
    const authCookie = await this.authService.getCookieWithJwtToken(+userId);

    res.setHeader('Set-Cookie', authCookie);

    return res.status(201).send(user);
  }

  @Post('/login42')
  async loginDuoQuadra(@Body() { apiCode }: Login42Dto, @Res() res: Response) {
    const duoQuadraUser = await this.authService.loginDuoQuadra(apiCode);

    if (!duoQuadraUser) {
      throw new UnauthorizedException();
    }

    if (duoQuadraUser.tfa) {
      await this.usersService.generateTfaRequestForNow(
        String(duoQuadraUser.id),
      );

      return res.status(401).json({
        error: 'TFA_REQUIRED',
        userId: duoQuadraUser.id,
        message:
          'Two factor authentication has been enabled on that account. You are now able to verify your login action by sending the appropriate code.',
      });
    }
    await this.usersService.invalidateTfaRequest(String(duoQuadraUser.id));
    const authCookie = await this.authService.getCookieWithJwtToken(
      duoQuadraUser.id,
    );

    res.setHeader('Set-Cookie', authCookie);

    return res.status(201).send(duoQuadraUser);
  }

  /* not strictly necessary, but logging out a non-logged-in user makes no sense */
  @UseGuards(JwtAuthGuard)
  @Get('/log-out')
  async logoutUser(@Res() res: Response) {
    const logOutCookie = await this.authService.getLogOutCookie();

    res.setHeader('Set-Cookie', logOutCookie);

    return res.sendStatus(200);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/is-logged-in')
  async isLoggedIn() {
    return { loggedIn: true }
  }
}
