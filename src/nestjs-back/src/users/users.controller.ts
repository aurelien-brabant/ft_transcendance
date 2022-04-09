import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Body,
  ConflictException,
  NotFoundException,
  Query,
  Res,
  HttpCode,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { createReadStream, statSync } from 'fs';
import { join } from 'path/posix';
import { FileInterceptor } from '@nestjs/platform-express';
import { editFileName, imageFileFilter } from 'src/common/upload-utils';
import { diskStorage } from 'multer';
import { ValidateTfaDto } from '../auth/dto/validate-tfa-dto';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('/:id/ownedChannels')
  getOwnedChannels(@Param('id') id: string) {
    return this.usersService.getOwnedChannels(id);
  }

  @Get('/:id/joinedChannels')
  getJoinedChannels(@Param('id') id: string) {
    return this.usersService.getJoinedChannels(id);
  }

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

  @Post('/:id/stats/:status')
  async updateStats(@Param('id') id: string, @Param('status') status: string) {
    return this.usersService.updateStats(id, status);
  }

  @Get('/:id/photo')
  async findPhoto(@Param('id') id: string, @Res() res: any) {
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

  @Get('/:id/rank')
  findRank(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.usersService.findRrank(id, paginationQuery);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Delete(':id/:user/:action')
  removeRelation(
    @Param('id') id: string,
    @Param('user') userToUpdate: string,
    @Param('action') action: string,
  ) {
    return this.usersService.removeRelation(id, userToUpdate, action);
  }

  @Get(':id/randomAvatar')
  async getRandomAvatar(@Param('id') id: string) {
    return this.usersService.getRandomAvatar(id);
  }

  @Get(':id/avatar42')
  async get42Avatar(@Param('id') id: string) {
    return this.usersService.getAvatar42(id);
  }

  @Post(':id/uploadAvatar')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './avatars',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadAvatar(@Param('id') id: string, @UploadedFile() file) {
    return this.usersService.uploadAvatar(id, file.filename);
  }

  @Get(':id/generateTfa')
  async register(@Param('id') id: string, @Res() response: any) {
    const user = await this.usersService.findOne(id);

    if (!user) throw new NotFoundException();

    const { otpauthUrl } = await this.usersService.generateTfaSecret(user);

    return this.usersService.pipeQrCodeStream(response, otpauthUrl);
  }

  @Post(':id/enableTfa')
  @HttpCode(200)
  async enableTfa(@Param('id') id: string, @Body() { tfaCode }) {
    const user = await this.usersService.findOne(id);

    if (!user) throw new NotFoundException();

    const isCodeValid = this.usersService.isTfaCodeValid(tfaCode, user);

    if (!isCodeValid)
      throw new UnauthorizedException('Wrong authentication code');

    await this.usersService.enableTfa(String(user.id));
  }

  @Post(':id/validate-tfa')
  @HttpCode(200)
  async authenticate(
    @Param('id') id: string,
    @Body() { code: tfaCode }: ValidateTfaDto,
  ) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException();
    }

    console.log(user.lastTfaRequestTimestamp);
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
    console.log(isCodeValid);

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.usersService.validateTfaRequest(id);

    return { valid: true };
  }
}
