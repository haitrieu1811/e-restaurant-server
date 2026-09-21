import { Injectable, NotFoundException } from '@nestjs/common'
import { SignOptions } from 'jsonwebtoken'
import lodash from 'lodash'

import {
  EmailAlreadyExistsException,
  InvalidPasswordException,
  PhoneNumberAlreadyExistsException,
  RefreshTokenNotFoundException,
  UserInactiveException
} from '@/routes/auth/auth.error.js'
import { AuthRepo } from '@/routes/auth/auth.repo.js'
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  LogoutResType,
  RefreshTokenBodyType,
  RefreshTokenResType,
  RegisterBodyType,
  RegisterResType
} from '@/routes/auth/auth.schema.js'
import { BASE_ROLES } from '@/shared/constants/auth.js'
import { UserNotFoundException } from '@/shared/errors/user.error.js'
import { SharedUserRepo } from '@/shared/repositories/shared-user.repo.js'
import { HashingService } from '@/shared/services/hashing.service.js'
import { TokenPayload, TokenService } from '@/shared/services/token.service.js'
import { isPrismaUniqueConstraintError } from '@/shared/utils.js'

@Injectable()
export class AuthService {
  constructor(
    private readonly sharedUserRepo: SharedUserRepo,
    private readonly authRepo: AuthRepo,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService
  ) {}

  private async saveRefreshTokenToDb(refreshToken: string, userId: number) {
    const decoded = this.tokenService.verifyRefreshToken<TokenPayload & { iat: number; exp: number }>(refreshToken)
    await this.authRepo.createRefreshToken({
      token: refreshToken,
      user: { connect: { id: userId } },
      iat: new Date(decoded.iat * 1000),
      exp: new Date(decoded.exp * 1000)
    })
  }

  async signAccessToken(payload: Omit<TokenPayload, 'tokenType'>, options?: SignOptions): Promise<string> {
    return this.tokenService.signAccessToken(payload, options)
  }

  async signRefreshToken(payload: Omit<TokenPayload, 'tokenType'>, options?: SignOptions): Promise<string> {
    return this.tokenService.signRefreshToken(payload, options)
  }

  async signAccessAndRefreshToken(payload: Omit<TokenPayload, 'tokenType'>): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload)
    ])
    return { accessToken, refreshToken }
  }

  async login(body: LoginBodyType): Promise<LoginResType> {
    const user = await this.sharedUserRepo.findUnique({
      email: body.email,
      deletedAt: null
    })
    if (!user) {
      throw UserNotFoundException
    }

    if (!user.isActive) {
      throw UserInactiveException
    }

    const isPasswordValid = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordValid) {
      throw InvalidPasswordException
    }

    const tokens = await this.signAccessAndRefreshToken({
      userId: user.id,
      roleId: user.roleId
    })

    // Lưu Refresh Token vào CSDL theo Repository pattern
    await this.saveRefreshTokenToDb(tokens.refreshToken, user.id)

    return {
      ...tokens,
      user: lodash.omit(user, ['password', 'isActive'])
    }
  }

  async register(body: RegisterBodyType): Promise<RegisterResType> {
    const existingUser = await this.sharedUserRepo.findUnique({
      email: body.email
    })
    if (existingUser) {
      throw EmailAlreadyExistsException
    }

    if (body.phoneNumber) {
      const existingUserByPhone = await this.sharedUserRepo.findUnique({
        phoneNumber: body.phoneNumber
      })
      if (existingUserByPhone) {
        throw PhoneNumberAlreadyExistsException
      }
    }

    const role = await this.authRepo.findRoleByName(BASE_ROLES.STAFF.name)
    if (!role) {
      throw new NotFoundException('Error.RoleNotFound')
    }

    const hashedPassword = await this.hashingService.hash(body.password)

    try {
      const user = await this.sharedUserRepo.create({
        name: body.name,
        email: body.email,
        password: hashedPassword,
        phoneNumber: body.phoneNumber || null,
        role: {
          connect: { id: role.id }
        }
      })

      const tokens = await this.signAccessAndRefreshToken({
        userId: user.id,
        roleId: user.roleId
      })

      // Lưu Refresh Token vào CSDL theo Repository pattern
      await this.saveRefreshTokenToDb(tokens.refreshToken, user.id)

      return {
        ...tokens,
        user: lodash.omit(user, ['password', 'isActive'])
      }
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

  async refreshToken(body: RefreshTokenBodyType): Promise<RefreshTokenResType> {
    // 1. Verify token signature & expiry
    const decoded = this.tokenService.verifyRefreshToken<TokenPayload & { iat: number; exp: number }>(body.refreshToken)

    // 2. Kiểm tra Refresh Token cũ trong CSDL bằng AuthRepo
    const existingRefreshToken = await this.authRepo.findRefreshToken({ token: body.refreshToken })
    if (!existingRefreshToken) {
      throw RefreshTokenNotFoundException
    }

    // 3. Xóa Refresh Token cũ ra khỏi CSDL bằng AuthRepo
    await this.authRepo.deleteRefreshToken({ token: body.refreshToken })

    // 4. Kiểm tra User có tồn tại không
    const user = await this.sharedUserRepo.findUnique({
      id: decoded.userId,
      deletedAt: null
    })
    if (!user) {
      throw UserNotFoundException
    }

    // 5. Ký đồng thời cặp Token mới
    const tokens = await this.signAccessAndRefreshToken({
      userId: user.id,
      roleId: user.roleId
    })

    // 6. Lưu Refresh Token mới vào CSDL bằng AuthRepo
    await this.saveRefreshTokenToDb(tokens.refreshToken, user.id)

    return tokens
  }

  async logout(body: LogoutBodyType): Promise<LogoutResType> {
    // 1. Verify token signature & expiry
    this.tokenService.verifyRefreshToken(body.refreshToken)

    // 2. Kiểm tra Refresh Token trong CSDL bằng AuthRepo
    const existingRefreshToken = await this.authRepo.findRefreshToken({ token: body.refreshToken })
    if (!existingRefreshToken) {
      throw RefreshTokenNotFoundException
    }

    // 3. Xóa Refresh Token khỏi CSDL bằng AuthRepo
    await this.authRepo.deleteRefreshToken({ token: body.refreshToken })

    return {
      message: 'Success.Logout'
    }
  }
}
