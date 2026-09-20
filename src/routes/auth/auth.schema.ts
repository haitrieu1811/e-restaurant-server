import { z } from 'zod'

import { UserSchema } from '@/shared/schemas/shared-user.schema.js'
import { PHONE_NUMBER_REGEX } from '@/shared/constants/regex.js'

export const TokensResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
})

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true
})

export const LoginResSchema = TokensResSchema.extend({
  user: UserSchema.omit({
    password: true,
    isActive: true
  })
})

export const RegisterBodySchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  phoneNumber: true
})
  .extend({
    confirmPassword: z
      .string({ message: 'Error.ConfirmPasswordRequired' })
      .min(8, 'Error.ConfirmPasswordTooShort')
      .max(32, 'Error.ConfirmPasswordExceedsMaximumLength')
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Error.PasswordsDoNotMatch',
        path: ['confirmPassword']
      })
    }
    if (data.phoneNumber && !PHONE_NUMBER_REGEX.test(data.phoneNumber)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Error.InvalidPhoneNumber',
        path: ['phoneNumber']
      })
    }
  })
  .strict()

export const RegisterResSchema = LoginResSchema

export const RefreshTokenBodySchema = z.object({
  refreshToken: z.string({ message: 'Error.RefreshTokenRequired' })
})

export const RefreshTokenResSchema = TokensResSchema

export const LogoutBodySchema = z.object({
  refreshToken: z.string({ message: 'Error.RefreshTokenRequired' })
})

export const LogoutResSchema = z.object({
  message: z.string()
})

export type TokensResType = z.infer<typeof TokensResSchema>
export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type LoginResType = z.infer<typeof LoginResSchema>
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type RegisterResType = z.infer<typeof RegisterResSchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type RefreshTokenResType = z.infer<typeof RefreshTokenResSchema>
export type LogoutBodyType = z.infer<typeof LogoutBodySchema>
export type LogoutResType = z.infer<typeof LogoutResSchema>
