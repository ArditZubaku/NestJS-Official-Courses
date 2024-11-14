import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Response, Request } from 'express';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { SignUpDTO, SignInDTO, RefreshTokenDTO } from './dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  @Post('sign-up')
  signUp(@Body() signUpDTO: SignUpDTO) {
    return this.authenticationService.signUp(signUpDTO);
  }

  // Since by default for a successful operation Nest returns 201, for this case we want 200
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signInDTO: SignInDTO,
  ) {
    const { accessToken, refreshToken } =
      await this.authenticationService.signIn(signInDTO);
    response.cookie('accessToken', accessToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      /*
       If your JWT’s TTL is shorter than the cookie’s TTL, the cookie might still be valid in the browser after the JWT has expired, meaning that the client can continue sending a stale token (which will be rejected by your backend), causing unnecessary failed requests. Conversely, if the cookie’s TTL is shorter than the JWT’s TTL, the browser might delete the cookie before the token expires, causing the user to be logged out earlier than intended.
       */
      maxAge: this.jwtConfiguration.accessTokenTTL * 1_000,
    });

    response.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: this.jwtConfiguration.refreshTokenTTL * 1_000,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  async refreshTokens(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await this.authenticationService.refreshTokens({ refreshToken });
    response.cookie('refreshToken', newRefreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: this.jwtConfiguration.refreshTokenTTL * 1_000,
    });

    response.cookie('accessToken', newAccessToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: this.jwtConfiguration.accessTokenTTL * 1_000,
    });
  }
}
