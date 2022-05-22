import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  Response,
  Query,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream, statSync } from 'fs';
import { join } from 'path/posix';
import { diskStorage } from 'multer';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { editFileName, imageFileFilter } from 'src/utils/upload';
import { ValidateTfaDto } from './dto/validate-tfa-dto';
import { IsLoggedInUserGuard } from "./guard/is-logged-in-user.guard";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/search')
  async searchUsersBy(@Query('v') searchTerm: string) {
    if (searchTerm === undefined) {
      throw new BadRequestException('Missing "v" query parameter')
    }

    return this.usersService.searchUsers(searchTerm);
  }

  /* NOTE: userId can be either the actual database id of the user, or, preferrably on the frontend, their username */
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async findOne(@Param('userId') id: string) {
    return await this.usersService.findOne(id).catch((err) => {
      throw new NotFoundException(err.message);
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userId/photo')
  async findPhoto(@Param('userId') id: string, @Response() res: any) {
    const user = await this.usersService.findOne(id);

    if (!user || !user.pic) {
      throw new NotFoundException();
    }

    const avatarPath = join('/upload', 'avatars', user.pic);

    try {
      statSync(avatarPath);
    } catch (e) {
      throw new NotFoundException();
    }
    const file = createReadStream(avatarPath);

    file.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userId/rank')
  findRank(
    @Param('userId') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.usersService.findRank(id, paginationQuery);
  }


  /* anyone can create a new user to begin the authentication process */
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.usersService.create(createUserDto);

    if (!createdUser) {
      throw new ConflictException();
    }

    // exclude password from returned JSON
    const { password, ...userData } = createdUser;
    return userData;
  }

  @UseGuards(JwtAuthGuard, IsLoggedInUserGuard)
  @Patch(':userId')
  async update(@Param('userId') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto).catch((err) => {
      throw new BadRequestException(err.message);
    });
  }

  @UseGuards(JwtAuthGuard, IsLoggedInUserGuard)
  @Patch(':userId/:user/:action')
  async updateRelation(
    @Param('userId') id: string,
    @Param('user') userToUpdate: string,
    @Param('action') action: string,
  ) {
    return await this.usersService.updateRelation(id, userToUpdate, action).catch((err) => {
      throw new BadRequestException(err.message);
    });
  }

  @UseGuards(JwtAuthGuard, IsLoggedInUserGuard)
  @Delete(':userId')
  remove(@Param('userId') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, IsLoggedInUserGuard)
  @Get(':userId/randomAvatar')
  async getRandomAvatar(@Param('userId') id: string) {
    return this.usersService.getRandomAvatar(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/avatar42')
  async get42Avatar(@Param('userId') id: string) {
    return this.usersService.getAvatar42(id);
  }

  @UseGuards(JwtAuthGuard, IsLoggedInUserGuard)
  @Post(':userId/uploadAvatar')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: '/upload/avatars',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadAvatar(@Param('userId') id: string, @UploadedFile() file) {
    return this.usersService.uploadAvatar(id, file.filename);
  }

  @UseGuards(JwtAuthGuard, IsLoggedInUserGuard)
  @Get(':userId/generateTfa')
  async register(@Param('userId') id: string, @Res() response: any) {
    const user = await this.usersService.findOne(id);

    if (!user) throw new NotFoundException();

    const { otpauthUrl } = await this.usersService.generateTfaSecret(user);

    return this.usersService.pipeQrCodeStream(response, otpauthUrl);
  }

  @UseGuards(JwtAuthGuard, IsLoggedInUserGuard)
  @Post(':userId/enableTfa')
  @HttpCode(200)
  async enableTfa(@Param('userId') id: string, @Body() { tfaCode }) {
    const user = await this.usersService.findOne(id);

    if (!user) throw new NotFoundException();

    const isCodeValid = await this.usersService.isTfaCodeValid(tfaCode, user);

    if (!isCodeValid) {
      throw new BadRequestException('Wrong authentication code');
    }

    await this.usersService.enableTfa(String(user.id));
  }

  @Post(':userId/validate-tfa')
  @HttpCode(200)
  async authenticate(
    @Param('userId') id: string,
    @Body() { code: tfaCode }: ValidateTfaDto,
  ) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException();
    }

    if (user.lastTfaRequestTimestamp === null) {
      throw new UnauthorizedException(
        'No tfa request has been made, please attempt to login before validating tfa',
      );
    }

    const tfaRequestExpirationTime = process.env.TFA_REQUEST_EXPIRES_IN
      ? Number(process.env.TFA_REQUEST_EXPIRES_IN) * 60 * 1000
      : 5 * 60 * 1000;
    const tfaRequestExpirationEpoch =
      new Date(user.lastTfaRequestTimestamp).getTime() +
      tfaRequestExpirationTime;

    if (tfaRequestExpirationEpoch < Date.now()) {
      throw new UnauthorizedException(
        'Two factor authentication request has expired, please attempt to login using email/password again to regenerate one.',
      );
    }

    const isCodeValid = await this.usersService.isTfaCodeValid(tfaCode, user);

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.usersService.validateTfaRequest(id);

    return { valid: true };
  }
}
