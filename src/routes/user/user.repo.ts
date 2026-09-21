import { Injectable } from '@nestjs/common'

import { UserCreateInput, UserUpdateInput, UserWhereInput, UserWhereUniqueInput } from '@/generated/prisma/models.js'
import { PrismaService } from '@/shared/services/prisma.service.js'

@Injectable()
export class UserRepo {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: { skip?: number; take?: number; where?: UserWhereInput }) {
    const { skip, take, where } = params
    return this.prisma.user.findMany({
      skip,
      take,
      where: {
        deletedAt: null,
        ...where
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  count(where?: UserWhereInput) {
    return this.prisma.user.count({
      where: {
        deletedAt: null,
        ...where
      }
    })
  }

  findById(id: number) {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  findUnique(where: UserWhereUniqueInput) {
    return this.prisma.user.findUnique({
      where
    })
  }

  findRoleById(id: number) {
    return this.prisma.role.findUnique({
      where: { id }
    })
  }

  create(data: UserCreateInput) {
    return this.prisma.user.create({
      data
    })
  }

  update(id: number, data: UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data
    })
  }

  softDelete(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  }
}
