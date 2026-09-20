import { NestFactory } from '@nestjs/core'

import { AppModule } from '@/app.module.js'
import envConfig from '@/shared/constants/config.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(envConfig.PORT ?? 4000)
}
await bootstrap()
