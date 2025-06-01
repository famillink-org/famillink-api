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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates a user and returns user information with access token',
  })
  @ApiBody({ type: LoginInfoDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully authenticated',
    type: LoggedUserInfoDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(@Body() loginInfo: LoginInfoDto): Promise<LoggedUserInfoDto> {
    return await this.authService.login(loginInfo);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'Logs out a user by invalidating their token',
  })
  @ApiBody({ type: LogoutInfoDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged out',
  })
  async logout(@Body() logoutInfo: LogoutInfoDto): Promise<void> {
    await this.authService.logout(logoutInfo).then(() => undefined);
  }

  @UseApiKey()
  @HttpCode(HttpStatus.OK)
  @Post('forget-password')
  @ApiOperation({
    summary: 'Request password reset',
    description:
      "Initiates the password reset process by sending a reset link to the user's email",
  })
  @ApiBody({ type: ForgetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset email sent',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async forgetPassword(@Body() param: ForgetPasswordDto): Promise<void> {
    return await this.authService
      .requestForPasswordReset(param)
      .then(() => undefined);
  }

  @UseApiKey()
  @HttpCode(HttpStatus.OK)
  @Post('verify-reset-password-token')
  @ApiOperation({
    summary: 'Verify password reset token',
    description:
      'Verifies if a password reset token is valid and returns user information',
  })
  @ApiBody({ type: VerifyResetPasswordTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token is valid',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid token',
  })
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
  @ApiOperation({
    summary: 'Reset password',
    description: "Resets a user's password using a valid reset token",
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid token or password',
  })
  async resetPassword(@Body() param: ResetPasswordDto): Promise<void> {
    return await this.authService.resetPassword(param).then(() => undefined);
  }
}
