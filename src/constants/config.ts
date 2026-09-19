import { z } from 'zod'
import * as fs from 'node:fs'
import * as path from 'node:path'

// Nạp các biến từ file .env nếu chưa được nạp vào process.env
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envConfigContent = fs.readFileSync(envPath, 'utf-8')
  for (const line of envConfigContent.split('\n')) {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=')
      if (equalIndex !== -1) {
        const key = trimmedLine.slice(0, equalIndex).trim()
        let value = trimmedLine.slice(equalIndex + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    }
  }
}

// Định nghĩa Zod Schema validate các biến môi trường
export const configSchema = z.object({
  PORT: z.coerce.number(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL không được để trống'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET không được để trống'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET không được để trống'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().min(1, 'ACCESS_TOKEN_EXPIRES_IN không được để trống'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().min(1, 'REFRESH_TOKEN_EXPIRES_IN không được để trống'),
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL không đúng định dạng email'),
  ADMIN_NAME: z.string().min(1, 'ADMIN_NAME không được để trống'),
  ADMIN_PASSWORD: z.string().min(6, 'ADMIN_PASSWORD tối thiểu 6 ký tự')
})

export type ConfigSchema = z.infer<typeof configSchema>

// Validate biến môi trường bằng Zod safeParse
const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.error('❌ Error: Invalid environment variables in .env file:')
  console.error(JSON.stringify(configServer.error.format(), null, 2))
  throw new Error('Cấu hình file .env không hợp lệ')
}

export const envConfig = configServer.data

export default envConfig
