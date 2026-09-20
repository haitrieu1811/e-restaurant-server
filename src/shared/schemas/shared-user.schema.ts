import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number({ message: 'Error.IdInvalid' }).positive('Error.IdInvalid'),
  roleId: z.number({ message: 'Error.RoleIdRequired' }).positive('Error.RoleIdInvalid'),
  email: z.email('Error.EmailInvalid').trim(),
  phoneNumber: z.string().nullable().optional(),
  name: z.string({ message: 'Error.NameRequired' }).min(1, 'Error.NameRequired'),
  password: z
    .string({ message: 'Error.PasswordRequired' })
    .min(8, 'Error.PasswordTooShort')
    .max(32, 'Error.PasswordExceedsMaximumLength'),
  isActive: z.boolean({ message: 'Error.IsActiveInvalid' }).default(true),
  createdAt: z.coerce.date({ message: 'Error.CreatedAtInvalid' }),
  updatedAt: z.coerce.date({ message: 'Error.UpdatedAtInvalid' }),
  deletedAt: z.coerce.date({ message: 'Error.DeletedAtInvalid' }).nullable().optional()
})

export type UserType = z.infer<typeof UserSchema>
