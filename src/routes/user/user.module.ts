import { Module } from '@nestjs/common'

import { UserController } from '@/routes/user/user.controller.js'
import { UserRepo } from '@/routes/user/user.repo.js'
import { UserService } from '@/routes/user/user.service.js'

@Module({
  providers: [UserService, UserRepo],
  controllers: [UserController],
  exports: [UserService, UserRepo]
})
export class UserModule {}
