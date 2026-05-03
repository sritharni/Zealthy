import { Body, Controller, Get, Inject, Post, Req } from "@nestjs/common";
import type { Request } from "express";

import { LoginSchema, type LoginInput } from "@/shared";

import { jsonOk } from "@/common/http/response";

import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: LoginInput) {
    const input = LoginSchema.parse(body);
    return jsonOk(await this.authService.login(input.email, input.password));
  }

  @Post("logout")
  logout() {
    this.authService.logout();
    return jsonOk({ success: true });
  }

  @Get("me")
  async me(@Req() request: Request) {
    return jsonOk(await this.authService.getSession(request));
  }
}
