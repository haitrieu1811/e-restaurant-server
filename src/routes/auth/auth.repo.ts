import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/shared/services/prisma.service.js'
import { RefreshTokenCreateInput, RefreshTokenWhereUniqueInput } from '@/generated/prisma/models.js'

@Injectable()
export class AuthRepo {
  constructor(private readonly prisma: PrismaService) {}

  findRoleByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name }
    })
  }

  createRefreshToken(data: RefreshTokenCreateInput) {
    return this.prisma.refreshToken.create({
      data
    })
  }

  findRefreshToken(where: RefreshTokenWhereUniqueInput) {
    return this.prisma.refreshToken.findUnique({
      where
    })
  }

  deleteRefreshToken(where: RefreshTokenWhereUniqueInput) {
    return this.prisma.refreshToken.delete({
      where
    })
  }
}
