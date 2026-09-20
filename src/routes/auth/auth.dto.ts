import { createZodDto } from 'nestjs-zod'

import {
  LoginBodySchema,
  LoginResSchema,
  LogoutBodySchema,
  LogoutResSchema,
  RefreshTokenBodySchema,
  RefreshTokenResSchema,
  RegisterBodySchema,
  RegisterResSchema
} from '@/routes/auth/auth.schema.js'

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}
export class LoginResDTO extends createZodDto(LoginResSchema) {}

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class RegisterResDTO extends createZodDto(RegisterResSchema) {}

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}
export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema) {}

export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}
export class LogoutResDTO extends createZodDto(LogoutResSchema) {}
