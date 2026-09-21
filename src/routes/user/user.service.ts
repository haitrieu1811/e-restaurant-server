import { Injectable } from '@nestjs/common'
import lodash from 'lodash'

import {
  EmailAlreadyExistsException,
  PhoneNumberAlreadyExistsException,
  RoleNotFoundException,
  UserNotFoundException
} from '@/routes/user/user.error.js'
import { UserRepo } from '@/routes/user/user.repo.js'
import {
  CreateUserBodyType,
  CreateUserResType,
  DeleteUserResType,
  GetUserResType,
  GetUsersQueryType,
  GetUsersResType,
  UpdateUserBodyType,
  UpdateUserResType
} from '@/routes/user/user.schema.js'
import { HashingService } from '@/shared/services/hashing.service.js'
import { isPrismaUniqueConstraintError } from '@/shared/utils.js'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly hashingService: HashingService
  ) {}

  async getUsers(query: GetUsersQueryType): Promise<GetUsersResType> {
    const page = query.page || 1
    const limit = query.limit || 10
    const skip = (page - 1) * limit
    const search = query.search?.trim()

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phoneNumber: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}

    const [users, total] = await Promise.all([
      this.userRepo.findMany({ skip, take: limit, where }),
      this.userRepo.count(where)
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return {
      data: users.map((user) => lodash.omit(user, ['password'])),
      pagination: {
        page,
        limit,
        totalRows: total,
        totalPages
      }
    }
  }

  async getUserById(id: number): Promise<GetUserResType> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw UserNotFoundException
    }
    return lodash.omit(user, ['password'])
  }

  async createUser(body: CreateUserBodyType): Promise<CreateUserResType> {
    const existingEmailUser = await this.userRepo.findUnique({ email: body.email })
    if (existingEmailUser) {
      throw EmailAlreadyExistsException
    }

    if (body.phoneNumber) {
      const existingPhoneUser = await this.userRepo.findUnique({ phoneNumber: body.phoneNumber })
      if (existingPhoneUser) {
        throw PhoneNumberAlreadyExistsException
      }
    }

    const role = await this.userRepo.findRoleById(body.roleId)
    if (!role) {
      throw RoleNotFoundException
    }

    const hashedPassword = await this.hashingService.hash(body.password)

    try {
      const user = await this.userRepo.create({
        name: body.name,
        email: body.email,
        password: hashedPassword,
        phoneNumber: body.phoneNumber || null,
        avatar: body.avatar || null,
        role: {
          connect: { id: role.id }
        }
      })

      return lodash.omit(user, ['password'])
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        const target = (error.meta?.target as string[]) || []
        if (Array.isArray(target) && target.includes('phoneNumber')) {
          throw PhoneNumberAlreadyExistsException
        }
        if (Array.isArray(target) && target.includes('email')) {
          throw EmailAlreadyExistsException
        }
      }
      throw error
    }
  }

  async updateUser(id: number, body: UpdateUserBodyType): Promise<UpdateUserResType> {
    const existingUser = await this.userRepo.findById(id)
    if (!existingUser) {
      throw UserNotFoundException
    }

    if (body.phoneNumber && body.phoneNumber !== existingUser.phoneNumber) {
      const phoneUser = await this.userRepo.findUnique({ phoneNumber: body.phoneNumber })
      if (phoneUser && phoneUser.id !== id) {
        throw PhoneNumberAlreadyExistsException
      }
    }

    if (body.roleId) {
      const role = await this.userRepo.findRoleById(body.roleId)
      if (!role) {
        throw RoleNotFoundException
      }
    }

    const hashedPassword = body.password ? await this.hashingService.hash(body.password) : undefined

    try {
      const user = await this.userRepo.update(id, {
        ...(body.name && { name: body.name }),
        ...(body.avatar !== undefined && { avatar: body.avatar }),
        ...(body.phoneNumber !== undefined && { phoneNumber: body.phoneNumber }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(body.roleId && { role: { connect: { id: body.roleId } } }),
        ...(body.isActive !== undefined && { isActive: body.isActive })
      })

      return lodash.omit(user, ['password'])
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        const target = (error.meta?.target as string[]) || []
        if (Array.isArray(target) && target.includes('phoneNumber')) {
          throw PhoneNumberAlreadyExistsException
        }
      }
      throw error
    }
  }

  async deleteUser(id: number): Promise<DeleteUserResType> {
    const existingUser = await this.userRepo.findById(id)
    if (!existingUser) {
      throw UserNotFoundException
    }

    await this.userRepo.softDelete(id)

    return {
      message: 'Success.UserDelete'
    }
  }
}
