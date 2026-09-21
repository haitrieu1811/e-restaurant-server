import { z } from 'zod'

import { PHONE_NUMBER_REGEX } from '@/shared/constants/regex.js'
import { PaginationQuerySchema, PaginationResSchema } from '@/shared/schemas/pagination.schema.js'
import { UserSchema } from '@/shared/schemas/shared-user.schema.js'

export const GetUserParamsSchema = z.object({
  id: z.coerce.number({ message: 'Error.IdInvalid' }).positive('Error.IdInvalid')
})

export const UserItemResSchema = UserSchema.omit({
  password: true
})

export const GetUserResSchema = UserItemResSchema

export const GetUsersQuerySchema = PaginationQuerySchema.extend({
  search: z.string().optional()
})

export const GetUsersResSchema = z.object({
  data: z.array(UserItemResSchema),
  pagination: PaginationResSchema
})

export const CreateUserBodySchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  phoneNumber: true,
  avatar: true,
  roleId: true
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

export const CreateUserResSchema = UserItemResSchema

export const UpdateUserBodySchema = z
  .object({
    name: z.string({ message: 'Error.NameRequired' }).min(1, 'Error.NameRequired').optional(),
    avatar: z.string().nullable().optional(),
    phoneNumber: z.string().nullable().optional(),
    password: z
      .string()
      .min(8, 'Error.PasswordTooShort')
      .max(32, 'Error.PasswordExceedsMaximumLength')
      .optional(),
    roleId: z.number({ message: 'Error.RoleIdRequired' }).positive('Error.RoleIdInvalid').optional(),
    isActive: z.boolean({ message: 'Error.IsActiveInvalid' }).optional()
  })
  .superRefine((data, ctx) => {
    if (data.phoneNumber && !PHONE_NUMBER_REGEX.test(data.phoneNumber)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Error.InvalidPhoneNumber',
        path: ['phoneNumber']
      })
    }
  })
  .strict()

export const UpdateUserResSchema = UserItemResSchema

export const DeleteUserResSchema = z.object({
  message: z.string()
})

export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>
export type GetUserResType = z.infer<typeof GetUserResSchema>
export type GetUsersQueryType = z.infer<typeof GetUsersQuerySchema>
export type GetUsersResType = z.infer<typeof GetUsersResSchema>
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>
export type CreateUserResType = z.infer<typeof CreateUserResSchema>
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>
export type UpdateUserResType = z.infer<typeof UpdateUserResSchema>
export type DeleteUserResType = z.infer<typeof DeleteUserResSchema>
