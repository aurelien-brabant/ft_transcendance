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
import { NotFoundError } from 'rxjs';

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
      ],
      skip: offset,
      take: limit,
      order: {
        wins: 'DESC',
      },
    });
  }

  /**
   * The following fields are sensitive and unselected so they don't
   * appear in search bar results. This function aims to collect them
   * for a specific user.
   */
  async getUserSensitiveFields(id: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.email')
      .addSelect('user.tfa')
      .addSelect('user.hasTfaBeenValidated')
      .addSelect('user.lastTfaRequestTimestamp')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /* To be used only at generation */
  async getUserTfaSecret(id: string) {
    const user = await this.usersRepository.findOne(id, {
      select: [ 'tfaSecret' ],
    });

    if (!user) {
      throw new Error('User not found');
    }
    return user.tfaSecret;
  }

  async findOne(id: string) {
    /* if id can't be parsed as a number then it is assumed to be an username */
    const isDatabaseId = !isNaN(Number(id));

    const user = await this.usersRepository.findOne({
      relations: [
        'games',
        'achievements',
        'friends',
        'blockedUsers',
        'pendingFriendsSent',
        'pendingFriendsReceived',
      ],
      where: isDatabaseId ? { id } : { username: id }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const hidden = await this.getUserSensitiveFields(user.id.toString());

    user.email = hidden.email;
    user.tfa = hidden.tfa;
    user.tfaSecret = hidden.tfaSecret;
    user.hasTfaBeenValidated = hidden.hasTfaBeenValidated;
    user.lastTfaRequestTimestamp= hidden.lastTfaRequestTimestamp;

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
    const isDatabaseId = !isNaN(Number(id));

    const users = await this.findAll(paginationQuery);

    /* Sort from highest score and put users that didn't play at the end */
    users.sort(
      (a: User, b: User) =>
        (b.games.length - a.games.length)
    ).sort(
      (a: User, b: User) =>
        ((b.wins + b.ratio) - (a.wins + a.ratio))
    );

    let index: number;

    if (isDatabaseId) {
      index = users.findIndex((user) => user.id === parseInt(id));
    } else {
      index = users.findIndex((user) => user.username === id);
    }

    if (index === -1) {
      throw new Error('User not found');
    }

    return String(index + 1);
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
  updateUserRatio = (user: User) => {
    const ratio = Math.round(((user.wins + user.draws * 0.5) / (user.wins + user.draws + user.losses)) * 100) / 100;

    return ratio;
  };

  async updateStats(user: User, isDraw: boolean, isWinner: boolean) {
    if (isDraw) {
      user.draws += 1;
    } else if (isWinner) {
      user.wins += 1;
      
    } else {
      user.losses += 1;
    }
    user.ratio = this.updateUserRatio(user);

    const updatedUser = await this.usersRepository.save(user);

    await this.achievementsService.checkUserAchievement(user, 'wins', user.wins);
    await this.achievementsService.checkUserAchievement(user, 'games', (user.games.length + 1));

    return updatedUser;
  }

  async usernameIsAvailable(userId: string, username: string) {
    const user = await this.usersRepository.findOne({
      where: {
        username
      }
    });

    if (user && user.id !== parseInt(userId)) {
      throw new Error(`Username '${username}' not available.`);
    }
  }

  async emailIsUnique(userId: string, email: string) {
    const user = await this.usersRepository.findOne({
      where: {
        email
      }
    });

    if (user && user.id !== parseInt(userId)) {
      throw new Error("Email address already in use.");
    }
  }

  async updateBlockedUsers(id: string, users: User[]) {
    const blockList: User[] = [];

    for (const toBlock of users) {
      if (parseInt(id) !== toBlock.id) { /* User can't block themselve */
        const blockedUser = await this.usersRepository.findOne(toBlock.id);
        blockList.push(blockedUser);
      }
    }

    let user = await this.usersRepository.findOne(id, {
      relations: ['blockedUsers'],
    });

    user.blockedUsers = blockList;
    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    let user: User;

    if (updateUserDto.username) {
      await this.usernameIsAvailable(id, updateUserDto.username);
    }
    if (updateUserDto.email) {
      await this.emailIsUnique(id, updateUserDto.email);
    }

    if (updateUserDto.pendingFriendsSent) {
      if (updateUserDto.pendingFriendsSent.length < 1) {
        throw new Error('Cannot cancel sent invites.');
      }
      /* Send frienship invite */
      for (const receiver of updateUserDto.pendingFriendsSent) {
        user = await this.addFriendshipSent(id, receiver.id.toString());
      }
    } else if (updateUserDto.blockedUsers) {
      user = await this.updateBlockedUsers(id, updateUserDto.blockedUsers);
    } else { /* Default case */
      const user = await this.usersRepository.preload({
        id: +id,
        ...updateUserDto
      });

      if (!user) {
        throw new Error('Cannot update user.');
      }
      return this.usersRepository.save(user);
    }
    return user;
  }

  /* Avatar */
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
    const secret =  await this.getUserTfaSecret(String(user.id));

    if (!secret) {
      throw new NotFoundException('No TFA secret generated.');
    }

    return authenticator.verify({
      token: tfaCode,
      secret
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

  /* Relationships */
  async addFriendshipReceived(id: string, senderId: string) {
    if (id === senderId) {
      throw new Error('Operation not allowed.');
    }
    let user = await this.usersRepository.findOne(id, {
      relations: ['friends', 'pendingFriendsReceived'],
    });
    const sender = await this.usersRepository.findOne(senderId);

    if (!user || !sender) {
      throw new Error('Cannot add request. Receiver or sender not found.');
    }

    const alreadyFriend = !!user.friends.find((friend) => {
      return friend.id === sender.id;
    });

    if (!alreadyFriend) {
      const alreadyReceived = !!user.pendingFriendsReceived.find((sender) => {
        return sender.id === parseInt(senderId);
      });
  
      if (!alreadyReceived) {
        user.pendingFriendsReceived.push(sender);
        return this.usersRepository.save(user);
      }
    }
    return user;
  }

  async removeFriendshipReceived(id: string, senderId: string) {
    if (id === senderId) {
      throw new Error('Self-request not allowed. Please report the bug.');
    }
    let user = await this.usersRepository.findOne(id, {
      relations: ['pendingFriendsReceived'],
    });

    if (!user) {
      throw new Error('Cannot update user.');
    }

    const newPendingInvites = user.pendingFriendsReceived.filter((sender) => {
      return sender.id !== parseInt(senderId);
    });

    user.pendingFriendsReceived = newPendingInvites;
    return this.usersRepository.save(user);
  }

  async addFriendshipSent(id: string, receiverId: string) {
    if (id === receiverId) {
      throw new Error('Self-friendship not allowed.');
    }
    let user = await this.usersRepository.findOne(id, {
      relations: ['friends', 'pendingFriendsSent'],
    });
    const receiver = await this.usersRepository.findOne(receiverId, {
      relations: [ 'blockedUsers' ]
    });

    if (!user || !receiver) {
      throw new Error('Cannot add request. Receiver or sender not found.');
    }

    const isBlocked = !!receiver.blockedUsers.find((blocked) => {
      return blocked.id === user.id;
    });
    if (isBlocked) {
      throw new Error('Operation not allowed. You were blocked by user.');
    }

    const alreadyFriend = !!user.friends.find((friend) => {
      return friend.id === receiver.id;
    });
    if (alreadyFriend) {
      throw new Error(`${receiver.username} already accepted your request. Try to refresh the page.`);
    }

    const alreadySent = !!user.pendingFriendsSent.find((receiver) => {
      return receiver.id === receiver.id;
    });

    if (!alreadySent) {
      user.pendingFriendsSent.push(receiver);
      await this.addFriendshipReceived(receiverId, id);

      return this.usersRepository.save(user);
    }
    return user;
  }

  async removeFriendshipSent(id: string, receiverId: string) {
    if (id === receiverId) {
      throw new Error('Self-request not allowed. Please report the bug.');
    }
    let user = await this.usersRepository.findOne(id, {
      relations: ['pendingFriendsSent'],
    });

    if (!user) {
      throw new Error('Cannot update user. User not found.');
    }

    const newPendingInvites = user.pendingFriendsSent.filter((sender) => {
      return sender.id !== parseInt(receiverId);
    });

    user.pendingFriendsSent = newPendingInvites;
    return this.usersRepository.save(user);
  }

  async acceptFriendRequest(id: string, senderId: string) {
    let user = await this.usersRepository.findOne(id, {
      relations: ['friends', 'pendingFriendsReceived'],
    });
    const sender = await this.usersRepository.findOne(senderId);

    if (!user || !sender) {
      throw new Error('Cannot update user. Receiver or sender not found.');
    }

    const isInvited = !!user.pendingFriendsReceived.find((request) => {
      return request.id === sender.id;
    });
    if (!isInvited) {
      throw new Error('Adding friend without request not allowed.');
    }

    const alreadyFriend = !!user.friends.find((friend) => {
      return friend.id === sender.id;
    });
    if (alreadyFriend) {
      throw new Error('Already friend. Try to refresh the page.');
    }

    const newRequests = user.pendingFriendsReceived.filter((request) => {
      return request.id !== sender.id;
    });

    user.pendingFriendsReceived = newRequests;
    user.friends.push(sender);
    return this.usersRepository.save(user);
  }

  async validateFriendship(id: string, friendId: string) {
    let user = await this.usersRepository.findOne(id, {
      relations: ['friends', 'pendingFriendsSent'],
    });
    const friend = await this.usersRepository.findOne(friendId);

    const isInvited = !!user.pendingFriendsSent.find((request) => {
      return request.id === friend.id;
    });
    if (!isInvited) {
      throw new Error('Adding friend without request not allowed.');
    }

    const alreadyFriend = !!user.friends.find((friend) => {
      return friend.id === friend.id;
    });
    if (alreadyFriend) {
      throw new Error('Already friend. Try to refresh the page.');
    }

    const newRequests = user.pendingFriendsSent.filter((request) => {
      return request.id !== friend.id;
    });

    user.pendingFriendsSent = newRequests;
    user.friends.push(friend);
    return this.usersRepository.save(user);
  }

  async removeFriend(id: string, friendId: string) {
    if (id === friendId) {
      throw new Error('Self-friendship not allowed.');
    }

    let user = await this.usersRepository.findOne(id, {
      relations: ['friends'],
    });

    const isFriend = !!user.friends.find((friend) => {
      return friend.id === parseInt(friendId);
    });

    if (!isFriend) {
      throw new Error('Friendship already destroyed. Try to refresh the page.');
    }

    const newFriends = user.friends.filter((friend) => {
      return friend.id !== parseInt(friendId);
    });

    user.friends = newFriends;
    return this.usersRepository.save(user);
  }

  async updateRelation(id: string, otherUserId: string, action: string) {
    if (action === 'addFriend') {
      if (id === otherUserId) {
        throw new Error('Self-friendship not allowed.');
      }
      const user = await this.acceptFriendRequest(id, otherUserId);
      await this.achievementsService.checkUserAchievement(user, 'friends', user.friends.length);

      const friend = await this.validateFriendship(otherUserId, id);
      await this.achievementsService.checkUserAchievement(friend, 'friends', friend.friends.length);

      return user;

    } else if (action === 'rmFriend') {
      await this.removeFriend(otherUserId, id);

      return await this.removeFriend(id, otherUserId);
    }
    else if (action === 'rmRequest') {
      await this.removeFriendshipSent(otherUserId, id);

      return await this.removeFriendshipReceived(id, otherUserId);
    }
    throw new Error('Invalid request.');
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
    throw new Error('User sent no DM');
  }
}
