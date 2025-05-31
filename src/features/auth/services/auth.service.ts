import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../../core/data/user/services/user.service';
import { TokenEngineService } from '../../../core/token/token.engine.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailsService } from '../../../core/mails/mails.service';
import { LoginInfoDto } from '../dto/login-info.dto';
import { LoggedUserInfoDto } from '../dto/logged-user-info.dto';
import { LogoutInfoDto } from '../dto/logout-info.dto';
import { ForgetPasswordDto } from '../dto/forget-password.dto';
import { VerifyResetPasswordTokenDto } from '../dto/verify-reset-password.dto';
import { UserEntity } from '../../../core/data/user/entities/user.entity';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailsService: MailsService,
    private readonly userService: UserService,
    private readonly tokenEngine: TokenEngineService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginInfo: LoginInfoDto): Promise<LoggedUserInfoDto> {
    const user = await this.userService.findByUserNameAndPassword(
      loginInfo.username,
      loginInfo.password,
    );
    if (user === null || user === undefined) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.userName, role: user.role };
    return {
      id: user.id,
      username: user.userName,
      fullName: user.member
        ? user.member.firstName + ' ' + user.member.lastName
        : user.userName,
      role: user.role,
      memberId: user.member?.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      token: await this.jwtService.signAsync(payload),
    };
  }

  async logout(logoutInfo: LogoutInfoDto): Promise<void> {
    await this.tokenEngine.addUsedJwtToken(logoutInfo.token, logoutInfo.userId);
  }

  async isTokenValid(token: string): Promise<boolean> {
    const usedToken = await this.tokenEngine.isJwtTokenUsed(token);
    return !usedToken;
  }

  async requestForPasswordReset(param: ForgetPasswordDto): Promise<void> {
    const user = await this.userService.findByUserName(param.userName);
    if (user) {
      const token = await this.tokenEngine.createTokenForPasswordReset(
        user.id,
        +this.configService.get('PASSWORD_RESET_LINK_DURATION'),
      );
      await this.mailsService.sendTemplatedEmail({
        to: user.userName,
        templateName: 'reseting_password',
        templateData: {
          first_name: user?.member?.firstName
            ? user?.member?.firstName
            : user.userName,
          last_name: user?.member?.lastName ? user?.member?.lastName : '',
          reset_token: `${this.configService.get(
            'APP_FRONTEND_URL',
          )}/auth/password-reset/${token}/${user.id}`,
          support_email: this.configService.get('APP_SUPPORT_EMAIL') as string,
          version: this.configService.get('APP_VERSION') as string,
          copyright: this.configService.get('APP_COPYRIGHT') as string,
        },
      });
    }
  }

  async verifyResetPasswordToken(
    param: VerifyResetPasswordTokenDto,
  ): Promise<UserEntity | null | undefined> {
    return await this.tokenEngine.getUserForTokenWhereUserIdIsUserIdIdAndTokenIsValid(
      param.token,
      param.userId,
    );
  }

  async resetPassword(param: ResetPasswordDto): Promise<void> {
    await this.tokenEngine.setTokenUsed(param.token);
    const user = await this.userService.read(param.userId);
    if (user) {
      user.password = param.newPassword;
    }
    return await this.userService.update(user);
  }
}
