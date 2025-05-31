import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Public } from '../../../core/decorators/public.decorator';
import { UseApiKey } from '../../../core/decorators/useApiKey.decorator';
import { VerifyResetPasswordTokenDto } from '../dto/verify-reset-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { LogoutInfoDto } from '../dto/logout-info.dto';
import { ForgetPasswordDto } from '../dto/forget-password.dto';
import { LoggedUserInfoDto } from '../dto/logged-user-info.dto';
import { LoginInfoDto } from '../dto/login-info.dto';
import { UserDto } from '../../users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginInfo: LoginInfoDto): Promise<LoggedUserInfoDto> {
    return await this.authService.login(loginInfo);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() logoutInfo: LogoutInfoDto): Promise<void> {
    await this.authService.logout(logoutInfo).then(() => undefined);
  }

  @UseApiKey()
  @HttpCode(HttpStatus.OK)
  @Post('forget-password')
  async forgetPassword(@Body() param: ForgetPasswordDto): Promise<void> {
    return await this.authService
      .requestForPasswordReset(param)
      .then(() => undefined);
  }

  @UseApiKey()
  @HttpCode(HttpStatus.OK)
  @Post('verify-reset-password-token')
  async verifyResetPasswordToken(
    @Body() param: VerifyResetPasswordTokenDto,
  ): Promise<UserDto> {
    return await this.authService
      .verifyResetPasswordToken(param)
      .then((user) => {
        if (user) {
          return UserDto.fromEntity(user);
        } else {
          throw new Error('Invalid token');
        }
      });
  }

  @UseApiKey()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() param: ResetPasswordDto): Promise<void> {
    return await this.authService.resetPassword(param).then(() => undefined);
  }
}
