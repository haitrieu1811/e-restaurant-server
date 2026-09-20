import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor } from 'nestjs-zod'

import { AuthModule } from '@/routes/auth/auth.module.js'
import CustomZodValidationPipe from '@/shared/pipes/custom-zod-validation.pipe.js'
import { SharedModule } from '@/shared/shared.module.js'

@Module({
  imports: [SharedModule, AuthModule],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor
    }
  ]
})
export class AppModule {}
