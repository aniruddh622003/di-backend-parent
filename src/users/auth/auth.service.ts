import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { AuthDto, SignUpDto } from './dto';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ITokens } from './interfaces/tokens.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUtilsService } from '@di/auth-utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private authUtils: AuthUtilsService,
  ) {}

  async signupLocal(dto: SignUpDto): Promise<ITokens> {
    const hash = await this.authUtils.hashData(dto.password);

    const user = new User(dto).setHash(hash);
    await this.entityManager.save(user);

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async signinLocal(dto: AuthDto): Promise<ITokens> {
    const user = await this.userRepository.findOneBy({
      username: dto.username,
    });
    if (!user) throw new ForbiddenException('Access Denied: Wrong Username');

    const passwordMatches = await bcrypt.compare(dto.password, user.hash);
    if (!passwordMatches)
      throw new ForbiddenException('Access Denied: Wrong Password');

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: number) {
    await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ hashedRt: null })
      .where('id = :id', { id: userId })
      .andWhere('hashedRt IS NOT NULL')
      .execute();
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<ITokens> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!user) throw new ForbiddenException('Access Denied');

    if (!user.hashedRt)
      throw new ForbiddenException('Access denied: Logged out user');

    Logger.log(refreshToken, user.hashedRt);
    const rtMatches = await bcrypt.compare(refreshToken, user.hashedRt!);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  //#region Utitlity Functions

  /**
   * Function responsible to create token sets for user.
   * @param userId
   * @param username
   * @returns A token set of accessToken, refreshToken for the provided user
   */
  private async getTokens(userId: number, username: string): Promise<ITokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username: username,
        },
        {
          expiresIn: 60 * 15,
          secret: this.configService.getOrThrow('AT_SECRET'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username: username,
        },
        {
          expiresIn: 60 * 60 * 24,
          secret: this.configService.getOrThrow('RT_SECRET'),
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  /**
   * Function to update a user's refresh token hash stored in the database.
   * @param userId
   * @param refreshToken
   */
  private async updateRtHash(userId: number, refreshToken: string) {
    const hash = await this.authUtils.hashData(refreshToken);
    await this.userRepository.update(userId, { hashedRt: hash });
  }
  //#endregion
}
