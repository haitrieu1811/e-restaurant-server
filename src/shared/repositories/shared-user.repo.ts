import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/shared/services/prisma.service.js'
import { UserCreateInput, UserWhereUniqueInput } from '@/generated/prisma/models.js'

@Injectable()
export class SharedUserRepo {
  constructor(private readonly prisma: PrismaService) {}

  findUnique(where: UserWhereUniqueInput) {
    return this.prisma.user.findUnique({
      where
    })
  }

  create(data: UserCreateInput) {
    return this.prisma.user.create({
      data
    })
  }
}
