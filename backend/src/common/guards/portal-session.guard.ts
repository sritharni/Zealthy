import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

import { AuthService } from "@/features/auth/auth.service";
import { ApiError } from "@/lib/http/api-error";

@Injectable()
export class PortalSessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const session = await this.authService.getSession(request);
    const requestedId = request.params?.id;
    if (!requestedId || requestedId !== session.sub) {
      throw ApiError.forbidden("Patient cannot access another patient's record");
    }
    return true;
  }
}
