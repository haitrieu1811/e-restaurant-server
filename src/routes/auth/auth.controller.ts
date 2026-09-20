import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ZodResponse } from 'nestjs-zod'

import {
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  LogoutResDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO
} from '@/routes/auth/auth.dto.js'
import { AuthService } from '@/routes/auth/auth.service.js'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: LoginResDTO })
  login(@Body() body: LoginBodyDTO) {
    return this.authService.login(body)
  }

  @Post('register')
  @ZodResponse({ type: RegisterResDTO })
  register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body)
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: RefreshTokenResDTO })
  refreshToken(@Body() body: RefreshTokenBodyDTO) {
    return this.authService.refreshToken(body)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: LogoutResDTO })
  logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body)
  }
}
