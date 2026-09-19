import { NestFactory } from '@nestjs/core'

import envConfig from '@/constants/config.js'
import { AppModule, ObserveInstrument } from '@/app.module.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument
  })
  await app.listen(envConfig.PORT ?? 4000)
}
await bootstrap()
