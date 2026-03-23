import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    if (request.url.includes('/auth/login') || request.url.includes('/auth/register') || request.url.includes('/auth/logout')) {
      return true;
    }

    const csrfCookie = request.cookies['XSRF-TOKEN'];
    const csrfHeader = request.headers['x-xsrf-token'];

    console.log('CSRF Cookie:', csrfCookie);
    console.log('CSRF Header:', csrfHeader);

    if (!csrfCookie || csrfCookie !== csrfHeader) {
      throw new ForbiddenException('Invalid CSRF Token');
    }

    return true;
  }
}