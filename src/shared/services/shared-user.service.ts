import { Injectable } from '@nestjs/common'

import { OldPasswordInvalidException, UserNotFoundException } from '@/shared/errors/user.error.js'
import { SharedUserRepo } from '@/shared/repositories/shared-user.repo.js'
import { HashingService } from '@/shared/services/hashing.service.js'

@Injectable()
export class SharedUserService {
  constructor(
    private readonly sharedUserRepo: SharedUserRepo,
    private readonly hashingService: HashingService
  ) {}

  async changePassword(userId: number, body: { oldPassword: string; newPassword: string }) {
    const user = await this.sharedUserRepo.findUnique({ id: userId, deletedAt: null })
    if (!user) {
      throw UserNotFoundException
    }

    const isMatch = await this.hashingService.compare(body.oldPassword, user.password)
    if (!isMatch) {
      throw OldPasswordInvalidException
    }

    const hashedPassword = await this.hashingService.hash(body.newPassword)
    await this.sharedUserRepo.update({ id: userId }, { password: hashedPassword })

    return {
      message: 'Success.ChangePassword'
    }
  }
}
