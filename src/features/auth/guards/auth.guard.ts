import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../../../core/decorators/public.decorator';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { Reflector } from '@nestjs/core';
import { IS_API_KEY } from '../../../core/decorators/useApiKey.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublic(context)) {
      return true;
    }
    if (this.isUseApiKey(context)) {
      return this.verifyApiKey(context);
    }
    return this.verifyJwtToken(context);
  }

  private isPublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private isUseApiKey(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_API_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private verifyApiKey(context: ExecutionContext) {
    const apiKey = this.configService.get<string>('INTERNAL_API_KEY');
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    return apiKey === token;
  }

  private async verifyJwtToken(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    if (!(await this.authService.isTokenValid(token))) {
      console.log('token invalid');
      throw new UnauthorizedException();
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      request['user'] = await this.jwtService.verifyAsync(token);
    } catch {
      console.log('token invalid 2');
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
