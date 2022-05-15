import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { join } from 'path';
import { faker } from '@faker-js/faker';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { hash as hashPassword } from 'bcryptjs';
import { AchievementsService } from 'src/achievements/achievements.service';
import { User } from './entities/users.entity';
import { CreateDuoQuadraDto } from './dto/create-duoquadra.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { prefixWithRandomAdjective } from 'src/utils/prefixWithRandomAdjective';
import { downloadResource } from 'src/utils/download';
import { use } from 'passport';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly achievementsService: AchievementsService,
  ) {}

  /* Search */
  findAll(paginationQuery: PaginationQueryDto) {
    const { offset, limit } = paginationQuery;
    return this.usersRepository.find({
      relations: [
        'games',
        'friends',
        'blockedUsers',
        'pendingFriendsSent',
        'pendingFriendsReceived',
      ],
      skip: offset,
      take: limit,
      order: {
        ratio: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    /* if id can't be parsed as a number then it is assumed to be an username */
    const isDatabaseId = !isNaN(Number(id))
    const user = await this.usersRepository.findOne({
      relations: [
        'games',
        'friends',
        'achievements',
        'blockedUsers',
        'pendingFriendsSent',
        'pendingFriendsReceived',
      ],
      where: isDatabaseId ? { id } : { username: id }
    });

    /* TODO: we shouldn't use HTTP-specific exceptions inside services */
    if (!user) {
      throw new NotFoundException(`User [${id}] not found`);
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User> | null {
    const user = await this.usersRepository.findOne({ email });
    return user;
  }

  async findOneByDuoQuadraLogin(login: string): Promise<User> | null {
    return this.usersRepository.findOne({
      duoquadra_login: login,
    });
  }

  async findUserPassword(email: string): Promise<User> | null {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.password')
      .where('user.email = :email', { email })
      .getOne();

    return user;
  }

  async findRank(id: string, paginationQuery: PaginationQueryDto) {
    const users = await this.findAll(paginationQuery);
    let rank: string;

    for (let i = 0; i < users.length; i++) {
      if (String(users[i].id) === id) rank = String(i + 1);
    }
    return rank;
  }

  async searchUsers(searchTerm: string) {
    const users = await this.usersRepository.find({
      where: [
        {
          username: ILike(`%${searchTerm}%`)
        },
        {
          duoquadra_login: ILike(`%${searchTerm}%`)
        },
      ]
    })

    return users;
  }

  /* Checkers */
  async checkUsernameIsAvailable(username: string) {
    const duplicatedUsername = await this.usersRepository.createQueryBuilder('user')
      .where('user.username = :username', { username })
      .getOne();

    if (duplicatedUsername) {
      throw new Error(`Username '${username}' not available.`);
    }
  }

  /* Helpers */
  updateUserRatio = (user: User) => {
    const ratio = Math.round(((user.wins + user.draws * 0.5) / (user.wins + user.draws + user.losses)) * 100) / 100;

    return ratio;
  };

  /* Create */
  async createDuoQuadra(
    { email, login }: CreateDuoQuadraDto,
    ftBearer: string,
  ): Promise<User> {
    // we need to generate an username for the duoquadra. However, we can't guarantee that another user
    // isn't using the duoquadra's login as username currently. Thus we need to check for that possiblity and
    // generate a random prefix in case the login is already taken.

    let actualLogin = login;
    let u: User | null = null;

    do {
      actualLogin = prefixWithRandomAdjective(login, 50);
      u = await this.usersRepository.findOne({ username: actualLogin });
    } while (u);

    const imageLoc = join('/upload', 'avatars', actualLogin);

    /* explictly fetch from CDN, since for some reason the API provides a private link lol */
    await downloadResource(
      `https://cdn.intra.42.fr/users/${login}.jpg`,
      imageLoc,
    );

    const user = this.usersRepository.create({
      username: actualLogin,
      email,
      pic: actualLogin,
      duoquadra_login: login,
    });

    return this.usersRepository.save(user);
  }

  async create(createUserDto: CreateUserDto) {
    let u: User | null = null;

    u = await this.usersRepository.findOne({
      email: createUserDto.email,
      duoquadra_login: null, // we don't want to match duoquadras whatsoever
    });

    // user with that email already exists
    if (u) return null;

    // Generate a username based on the first part of the user's email address.
    const baseUsername = createUserDto.email.split('@')[0];
    let username = baseUsername;

    // repeats until the username is unique at this point in time
    do {
      username = prefixWithRandomAdjective(baseUsername, 50);
      u = await this.usersRepository.findOne({ username: username });
    } while (u);

    // hash the password with bcrypt using 10 salt rounds
    const hashedPwd = await hashPassword(createUserDto.password, 10);

    const imageLoc = join('/upload', 'avatars', username);

    await downloadResource(faker.image.nature(), imageLoc);

    const user = this.usersRepository.create({
      ...createUserDto,
      username,
      password: hashedPwd,
      pic: username,
    });

    return this.usersRepository.save(user);
  }

  /* Update */
  async update(id: string, updateUserDto: UpdateUserDto) {
    let user: User | null = null;
    let tmpDto = {};

    /* Informations */
    if (updateUserDto.username) {
      await this.checkUsernameIsAvailable(updateUserDto.username);
    }

    /* Achievements */
    const checkAchievements = async (level: number, type: string) => {
      this.achievementsService.findAchievements().then(async (list) => {
        for (let i in list)
          if (list[i].levelToReach <= level && list[i].type === type)
            await this.achievementsService.update(String(list[i].id), {
              users: [user],
            });
      });
    };

    /* NOTE: achievements must be given another way
    if (updateUserDto.wins || updateUserDto.losses || updateUserDto.draws) {
      user = await this.usersRepository.findOne(id);
      const wins = updateUserDto.wins ? updateUserDto.wins : user.wins;
      const losses = updateUserDto.losses ? updateUserDto.losses : user.losses;
      const draws = updateUserDto.draws ? updateUserDto.draws : user.draws;
      const ratio =
        Math.round(((wins + draws * 0.5) / (wins + draws + losses)) * 100) /
        100;
      tmpDto = { ...tmpDto, ratio: ratio };

      if (updateUserDto.wins) checkAchievements(wins, 'wins');
    }
    if (updateUserDto.games) {
      user = await this.usersRepository.findOne(id, {
        relations: ['games'],
      });
      const updated = [...user.games, ...updateUserDto.games];
      tmpDto = { ...tmpDto, games: updated };

      if (updated.length) checkAchievements(updated.length, 'games');
    }
    */
    if (updateUserDto.friends) {
      const newFriend = updateUserDto.friends[0];

      user = await this.usersRepository.findOne(id, {
        relations: ['friends'],
      });
      const updated = [...user.friends, ...updateUserDto.friends];
      tmpDto = { ...tmpDto, friends: updated };

      if (updated.length) checkAchievements(updated.length, 'friends');

      if (newFriend) {
        const friend = await this.addFriend(newFriend.id.toString(), user);
        checkAchievements(friend.friends.length, 'friends');
      }
    }
    if (updateUserDto.blockedUsers) {
      user = await this.usersRepository.findOne(id, {
        relations: ['blockedUsers'],
      });
      tmpDto = {
        ...tmpDto,
        blockedUsers: [...user.blockedUsers, ...updateUserDto.blockedUsers],
      };
    }

    /* Friendship invite */
    if (updateUserDto.pendingFriendsSent) {
      const friend = updateUserDto.pendingFriendsSent[0];

      user = await this.usersRepository.findOne(id, {
        relations: ['pendingFriendsSent'],
      });
      tmpDto = {
        ...tmpDto,
        pendingFriendsSent: [
          ...user.pendingFriendsSent,
          ...updateUserDto.pendingFriendsSent,
        ],
      };
      if (friend) {
        await this.addFriendshipReceived(friend.id.toString(), user);
      }
    }

    if (updateUserDto.pendingFriendsReceived) {
      user = await this.usersRepository.findOne(id, {
        relations: ['pendingFriendsReceived'],
      });
      tmpDto = {
        ...tmpDto,
        pendingFriendsReceived: [
          ...user.pendingFriendsReceived,
          ...updateUserDto.pendingFriendsReceived,
        ],
      };
    }

    user = await this.usersRepository.preload({
      id: +id,
      ...{ ...updateUserDto, ...tmpDto },
    });

    if (!user)
      throw new NotFoundException(`Cannot update user[${id}]: Not found`);
    return this.usersRepository.save(user);
  }

  async uploadAvatar(id: string, filename: string) {
    await this.usersRepository.update(id, {
      pic: filename,
    });

    return { upload: 'success' };
  }

  async getRandomAvatar(id: string) {
    let user = await this.usersRepository.findOne(id);

    const imageLoc = join('/upload', 'avatars', user.pic);

    await downloadResource(faker.image.nature(), imageLoc);

    return { upload: 'success' };
  }

  async getAvatar42(id: string) {
    let user = await this.usersRepository.findOne(id);

    const imageLoc = join('/upload', 'avatars', user.pic);

    await downloadResource(
      `https://cdn.intra.42.fr/users/${user.duoquadra_login}.jpg`,
      imageLoc,
    );

    return { upload: 'success' };
  }

  /* Remove */
  async remove(id: string) {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }

  /* Security */
  async pipeQrCodeStream(stream: any, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  /* TFA */
  async setTfaSecret(secret: string, id: string) {
    return this.usersRepository.update(id, {
      tfaSecret: secret,
    });
  }

  async enableTfa(id: string) {
    return this.usersRepository.update(id, {
      tfa: true,
    });
  }

  async generateTfaSecret(user: User) {
    const secret = authenticator.generateSecret();
    const tfaAppName = 'ft_transcendance';

    const otpauthUrl = authenticator.keyuri(user.email, tfaAppName, secret);

    await this.setTfaSecret(secret, String(user.id));

    return {
      secret,
      otpauthUrl,
    };
  }

  async generateTfaRequestForNow(userId: string) {
    const user = await this.findOne(userId);
    const tfaRequestNow = new Date(
      Date.now() + 5000,
    ); /* 5 seconds offset to anticipate request time */

    if (user) {
      await this.usersRepository.save({
        ...user,
        lastTfaRequestTimestamp: tfaRequestNow,
      });
    }
  }

  async isTfaCodeValid(tfaCode: string, user: User) {
    return authenticator.verify({
      token: tfaCode,
      secret: user.tfaSecret,
    });
  }

  async validateTfaRequest(userId: string) {
    const user = await this.findOne(userId);

    if (!user) {
      return;
    }

    await this.usersRepository.save({
      ...user,
      hasTfaBeenValidated: true,
    });
  }

  async invalidateTfaRequest(userId: string) {
    const user = await this.findOne(userId);

    user.lastTfaRequestTimestamp = null;
    user.hasTfaBeenValidated = false;
    await this.usersRepository.save(user);
  }

  async hasOnGoingTfaRequest(userId: string) {
    const user = await this.findOne(userId);

    if (!user) {
      return false;
    }

    const tfaRequestExpirationTime = process.env.TFA_REQUEST_EXPIRES_IN
      ? Number(process.env.TFA_REQUEST_EXPIRES_IN) * 60 * 1000
      : 5 * 60 * 1000;
    const tfaRequestExpirationEpoch =
      new Date(user.lastTfaRequestTimestamp).getTime() +
      tfaRequestExpirationTime;

    return tfaRequestExpirationEpoch >= Date.now();
  }

  /* Games */
  async updateStats(user: User, isDraw: boolean, isWinner: boolean) {
    if (isDraw) {
      user.draws += 1;
    } else if (isWinner) {
      user.wins += 1;
    } else {
      user.losses += 1;
    }
    user.ratio = this.updateUserRatio(user);

    return this.usersRepository.save(user);
  }

  /* Relationships */
  async addFriendshipReceived(id: string, from: User) {
    let user = await this.usersRepository.findOne(id, {
      relations: ['pendingFriendsReceived'],
    });

    if (!user)
      throw new NotFoundException(`Cannot update user[${id}]: Not found`);

    user.pendingFriendsReceived.push(from);
    return this.usersRepository.save(user);
  }

  async removeFriendshipReceived(id: string, senderId: string) {
    let user = await this.usersRepository.findOne(id, {
      relations: ['pendingFriendsReceived'],
    });

    if (!user)
      throw new NotFoundException(`Cannot update user[${id}]: Not found`);

    const newPendingInvites = user.pendingFriendsReceived.filter((sender) => {
      return sender.id !== parseInt(senderId);
    });

    user.pendingFriendsReceived = newPendingInvites;
    return this.usersRepository.save(user);
  }

  async removeFriendshipSent(id: string, receiverId: string) {
    let user = await this.usersRepository.findOne(id, {
      relations: ['pendingFriendsSent'],
    });

    if (!user)
      throw new NotFoundException(`Cannot update user[${id}]: Not found`);

    const newPendingInvites = user.pendingFriendsSent.filter((sender) => {
      return sender.id !== parseInt(receiverId);
    });

    user.pendingFriendsSent = newPendingInvites;
    return this.usersRepository.save(user);
  }

  async addFriend(id: string, from: User) {
    let user = await this.usersRepository.findOne(id, {
      relations: ['friends'],
    });

    if (!user)
      throw new NotFoundException(`Cannot update user[${id}]: Not found`);

    user.friends.push(from);
    return this.usersRepository.save(user);
  }

  async removeFriend(id: string, friendId: string) {
    let user = await this.usersRepository.findOne(id, {
      relations: ['friends'],
    });

    if (!user)
      throw new NotFoundException(`Cannot update user[${id}]: Not found`);

    const newFriends = user.friends.filter((friend) => {
      return friend.id !== parseInt(friendId);
    });

    user.friends = newFriends;
    return this.usersRepository.save(user);
  }

  async unblockUser(id: string, userId: string) {
    let user = await this.usersRepository.findOne(id, {
      relations: ['blockedUsers'],
    });

    if (!user)
      throw new NotFoundException(`Cannot update user[${id}]: Not found`);

    const newBlockedUsers = user.blockedUsers.filter((user) => {
      return user.id !== parseInt(userId);
    });

    user.blockedUsers = newBlockedUsers;
    return this.usersRepository.save(user);
  }

  async removeRelation(id: string, userToUpdate: string, action: string) {
    if (action === 'friend') {
      await this.removeFriend(userToUpdate, id);
      return await this.removeFriend(id, userToUpdate);
    }
    else if (action === 'unblock') {
      return await this.unblockUser(id, userToUpdate);
    }
    else if (action === 'removeFriendsSent') {
      await this.removeFriendshipReceived(userToUpdate, id);
      return await this.removeFriendshipSent(id, userToUpdate);
    }
    else if (action === 'removeFriendsReceived') {
      await this.removeFriendshipSent(userToUpdate, id);
      return await this.removeFriendshipReceived(id, userToUpdate);
    }
    throw new NotFoundException(`No corresponding action found.`);
  }

  /* Chat */

  /**
   * Get a Direct Message between two users
   * 
   * @param id - The id of the user to which the result will be send back to
   * @param friendId - The id of the user's friend
   * @returns A Direct Message
   */
  async getDirectMessage(id: string, friendId: string) {
    const user = await this.usersRepository.findOne(id, {
      relations: [
        'directMessages',
        'directMessages.users',
        'directMessages.messages',
        'directMessages.messages.author',
      ],
    });

    if (user && user.directMessages) {
      const dm = user.directMessages.find((dm) =>
        !!dm.users.find((user) => {
          return user.id === parseInt(friendId);
        })
      );
      if (dm) return dm;
    }
    throw new NotFoundException(`User [${id}] sent no DM`);
  }
}
