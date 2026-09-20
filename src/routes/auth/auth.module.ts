import { Module } from '@nestjs/common'

import { AuthController } from '@/routes/auth/auth.controller.js'
import { AuthRepo } from '@/routes/auth/auth.repo.js'
import { AuthService } from '@/routes/auth/auth.service.js'

@Module({
  providers: [AuthService, AuthRepo],
  controllers: [AuthController]
})
export class AuthModule {}
