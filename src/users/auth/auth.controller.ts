import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SignUpDto } from './dto';
import { ITokenResponse } from './interfaces/auth-response.interface';
import { AuthGuard } from '@nestjs/passport';
import {
  IRequestWithJWTParsed,
  IRequestWithJWTRefreshParsed,
} from '@di/auth-utils';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private test = 0;
  /**
   * test
   */
  @Post('/local/signup')
  async signupLocal(@Body() dto: SignUpDto): Promise<ITokenResponse> {
    const response: ITokenResponse = { data: null, messages: [] };

    try {
      const tokens = await this.authService.signupLocal(dto);
      response.data = tokens;
    } catch (e) {
      if (e instanceof Error) {
        response.messages.push(`Error ${e.name} : ${e.message}`);
      }
    }
    return response;
  }

  @Post('/local/signin')
  async signinLocal(@Body() dto: AuthDto): Promise<ITokenResponse> {
    const response: ITokenResponse = {
      data: null,
      messages: [],
    };
    try {
      const tokens = await this.authService.signinLocal(dto);
      response.data = tokens;
    } catch (e) {
      if (e instanceof Error) {
        response.messages.push(`Error ${e.name} : ${e.message}`);
      }
    }
    return response;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  logout(@Req() req: IRequestWithJWTParsed) {
    const user = req.user;
    this.authService.logout(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('/refresh')
  async refreshTokens(
    @Req() req: IRequestWithJWTRefreshParsed,
  ): Promise<ITokenResponse> {
    const user = req.user;

    const response: ITokenResponse = {
      data: null,
      messages: [],
    };
    try {
      const tokens = await this.authService.refreshTokens(
        user.sub,
        user.refreshToken,
      );
      response.data = tokens;
    } catch (e) {
      if (e instanceof Error) {
        response.messages.push(`Error ${e.name} : ${e.message}`);
      }
    }
    return response;
  }
}
