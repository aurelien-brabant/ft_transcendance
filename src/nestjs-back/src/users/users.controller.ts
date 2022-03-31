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
  Response,
  Query,
  Res,
  HttpCode,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { createReadStream, statSync } from 'fs';
import { join } from 'path/posix';
import { FileInterceptor } from '@nestjs/platform-express';
import { editFileName, imageFileFilter } from 'src/common/upload-utils';
import { diskStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { IsParamUserLoggedInUserGuard } from './guards/is-param-user-logged-in-user.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

//@Controller('users/:userId/:userId2')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  findOne(@Param('userId') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userId/ownedChannels')
  getOwnedChannels(@Param('userId') id: string) {
    return this.usersService.getOwnedChannels(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userId/joinedChannels')
  getJoinedChannels(@Param('userId') id: string) {
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

  @UseGuards(JwtAuthGuard, IsParamUserLoggedInUserGuard)
  @Post('/:userId/stats/:status')
  async updateStats(
    @Param('userId') id: string,
    @Param('status') status: string,
  ) {
    return this.usersService.updateStats(id, status);
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
    return this.usersService.findRrank(id, paginationQuery);
  }

  @UseGuards(JwtAuthGuard, IsParamUserLoggedInUserGuard)
  @Patch(':userId')
  update(@Param('userId') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, IsParamUserLoggedInUserGuard)
  @Delete(':userId')
  remove(@Param('userId') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, IsParamUserLoggedInUserGuard)
  @Delete(':userId/:user/:action')
  removeRelation(
    @Param('userId') id: string,
    @Param('user') userToUpdate: string,
    @Param('action') action: string,
  ) {
    return this.usersService.removeRelation(id, userToUpdate, action);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/randomAvatar')
  async getRandomAvatar(@Param('userId') id: string) {
    return this.usersService.getRandomAvatar(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/avatar42')
  async get42Avatar(@Param('userId') id: string) {
    return this.usersService.getAvatar42(id);
  }

  @UseGuards(JwtAuthGuard, IsParamUserLoggedInUserGuard)
  @Post(':userId/uploadAvatar')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './avatars',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadAvatar(@Param('userId') id: string, @UploadedFile() file) {
    return this.usersService.uploadAvatar(id, file.filename);
  }

  @UseGuards(JwtAuthGuard, IsParamUserLoggedInUserGuard)
  @Get(':userId/generateTfa')
  async register(@Param('userId') id: string, @Res() response: any) {
    const user = await this.usersService.findOne(id);

    if (!user) throw new NotFoundException();

    const { otpauthUrl } = await this.usersService.generateTfaSecret(user);

    return this.usersService.pipeQrCodeStream(response, otpauthUrl);
  }

  @UseGuards(JwtAuthGuard, IsParamUserLoggedInUserGuard)
  @Post(':userId/enableTfa')
  @HttpCode(200)
  async enableTfa(@Param('userId') id: string, @Body() { tfaCode }) {
    const user = await this.usersService.findOne(id);

    if (!user) throw new NotFoundException();

    const isCodeValid = this.usersService.isTfaCodeValid(tfaCode, user);

    if (!isCodeValid)
      throw new UnauthorizedException('Wrong authentication code');

    await this.usersService.enableTfa(String(user.id));
  }

  @UseGuards(JwtAuthGuard, IsParamUserLoggedInUserGuard)
  @Post(':userId/authenticateTfa')
  @HttpCode(200)
  async authenticate(@Param('userId') id: string, @Body() { tfaCode }) {
    const user = await this.usersService.findOne(id);

    if (!user) throw new NotFoundException();

    const isCodeValid = this.usersService.isTfaCodeValid(tfaCode, user);

    if (!isCodeValid)
      throw new UnauthorizedException('Wrong authentication code');

    return { tfaValidated: true };
  }
}
