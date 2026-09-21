import { createZodDto } from 'nestjs-zod'

import {
  CreateUserBodySchema,
  CreateUserResSchema,
  DeleteUserResSchema,
  GetUserParamsSchema,
  GetUserResSchema,
  GetUsersQuerySchema,
  GetUsersResSchema,
  UpdateUserBodySchema,
  UpdateUserResSchema
} from '@/routes/user/user.schema.js'

export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}
export class GetUserResDTO extends createZodDto(GetUserResSchema) {}

export class GetUsersQueryDTO extends createZodDto(GetUsersQuerySchema) {}
export class GetUsersResDTO extends createZodDto(GetUsersResSchema) {}

export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}
export class CreateUserResDTO extends createZodDto(CreateUserResSchema) {}

export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}
export class UpdateUserResDTO extends createZodDto(UpdateUserResSchema) {}

export class DeleteUserResDTO extends createZodDto(DeleteUserResSchema) {}

