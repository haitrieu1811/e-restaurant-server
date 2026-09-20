import { Global, Module } from '@nestjs/common'

import { PrismaService } from '@/shared/services/prisma.service.js'

const SHARED_PROVIDERS = [PrismaService]

@Global()
@Module({
  providers: SHARED_PROVIDERS,
  exports: SHARED_PROVIDERS
})
export class SharedModule {}
