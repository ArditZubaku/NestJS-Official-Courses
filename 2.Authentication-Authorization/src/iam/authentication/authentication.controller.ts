import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Response } from 'express';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { SignUpDTO, SignInDTO } from './dto';
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
    const { accessToken } = await this.authenticationService.signIn(signInDTO);
    response.cookie('accessToken', accessToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      /*
       If your JWT’s TTL is shorter than the cookie’s TTL, the cookie might still be valid in the browser after the JWT has expired, meaning that the client can continue sending a stale token (which will be rejected by your backend), causing unnecessary failed requests. Conversely, if the cookie’s TTL is shorter than the JWT’s TTL, the browser might delete the cookie before the token expires, causing the user to be logged out earlier than intended.
       */
      maxAge: this.jwtConfiguration.accessTokenTTL * 1_000,
    });
  }
}
