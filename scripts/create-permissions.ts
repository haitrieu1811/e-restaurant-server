import type { INestApplication } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { PrismaPg } from '@prisma/adapter-pg'

import { AppModule } from '@/app.module.js'
import { HttpMethod, PrismaClient } from '@/generated/prisma/client.js'
import { BASE_ROLES } from '@/shared/constants/auth.js'
import envConfig from '@/shared/constants/config.js'

const adapter = new PrismaPg({
  connectionString: envConfig.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })

export interface DiscoveredRoute {
  name: string
  method: HttpMethod
  path: string
  module: string
  description: string
}

/**
 * Trích xuất danh sách tất cả các HTTP Routes được khai báo trong ứng dụng NestJS
 */
export function discoverRoutes(app: INestApplication): DiscoveredRoute[] {
  const routes: DiscoveredRoute[] = []
  const httpAdapter = app.getHttpAdapter()
  const instance = httpAdapter.getInstance()
  const router = instance?._router || instance?.router

  if (router && Array.isArray(router.stack)) {
    router.stack.forEach((layer: any) => {
      if (layer.route) {
        const path: string = layer.route.path
        const methodsMap: Record<string, boolean> = layer.route.methods

        for (const [methodKey, isEnabled] of Object.entries(methodsMap)) {
          if (isEnabled) {
            const uppercaseMethod = methodKey.toUpperCase()
            const httpMethod = (
              Object.values(HttpMethod).includes(uppercaseMethod as HttpMethod) ? uppercaseMethod : 'ALL'
            ) as HttpMethod

            const segments = path.split('/').filter(Boolean)
            let moduleName = 'app'
            if (segments.length > 0) {
              moduleName = segments[0].toLowerCase()
            }

            const name = `${httpMethod} ${path}`
            const description = `Quyền truy cập API ${httpMethod} ${path}`

            routes.push({
              name,
              method: httpMethod,
              path,
              module: moduleName,
              description
            })
          }
        }
      }
    })
  }

  return routes
}

// Cấu hình giới hạn permissions cho từng role (ngoại trừ ADMIN)
const ROLE_PERMISSION_RULES: Record<string, { modules: string[] }> = {
  STAFF: {
    modules: ['order', 'auth']
  },
  CHEF: {
    modules: ['order', 'auth']
  }
}

async function createPermissions() {
  console.log('🚀 Bắt đầu quét và đồng bộ danh sách Permissions từ NestJS...')

  try {
    // 1. Khởi tạo ứng dụng NestJS ẩn log để trích xuất routes
    const app = await NestFactory.create(AppModule, { logger: false })
    await app.init()

    const discoveredRoutes = discoverRoutes(app)
    console.log(`🔍 Tìm thấy ${discoveredRoutes.length} route(s) trong hệ thống:`)
    discoveredRoutes.forEach((r) => console.log(`   - [Module: ${r.module}] ${r.name}`))

    const discoveredRouteNames = new Set(discoveredRoutes.map((r) => r.name))

    // 2. Cập nhật hoặc tạo mới các Permission có trong routes dự án
    console.log('\n📦 Đồng bộ danh sách Permission vào CSDL...')
    for (const route of discoveredRoutes) {
      const existing = await prisma.permission.findUnique({
        where: { name: route.name }
      })

      if (!existing) {
        await prisma.permission.create({
          data: {
            name: route.name,
            method: route.method,
            path: route.path,
            module: route.module,
            description: route.description
          }
        })
        console.log(`  ✅ Đã tạo Permission mới: ${route.name}`)
      } else {
        await prisma.permission.update({
          where: { name: route.name },
          data: {
            method: route.method,
            path: route.path,
            module: route.module,
            description: route.description
          }
        })
        console.log(`  🔄 Đã cập nhật Permission: ${route.name}`)
      }
    }

    // 3. Xóa các Permission có trong CSDL nhưng không còn nằm trong routes dự án
    console.log('\n🧹 Dọn dẹp các Permission không còn tồn tại trong routes...')
    const dbPermissions = await prisma.permission.findMany()
    const obsoletePermissions = dbPermissions.filter((p) => !discoveredRouteNames.has(p.name))

    if (obsoletePermissions.length > 0) {
      for (const p of obsoletePermissions) {
        await prisma.permission.delete({
          where: { id: p.id }
        })
        console.log(`  🗑️ Đã xóa Permission dư thừa: ${p.name}`)
      }
    } else {
      console.log('  ✨ Không có Permission dư thừa cần xóa.')
    }

    // 4. Phân quyền cho các Roles theo Module
    console.log('\n🔑 Gán Permissions cho các vai trò (Roles)...')
    const allPermissions = await prisma.permission.findMany()

    // ADMIN: Nhận toàn bộ Permissions
    const adminRole = await prisma.role.findUnique({
      where: { name: BASE_ROLES.ADMIN.name }
    })

    if (adminRole) {
      await prisma.role.update({
        where: { id: adminRole.id },
        data: {
          permissions: {
            set: allPermissions.map((p) => ({ id: p.id }))
          }
        }
      })
      console.log(`  👑 [ADMIN]: Được gán toàn bộ ${allPermissions.length} permissions`)
    }

    // Các Roles khác: Gán theo giới hạn module thích hợp
    const otherRoleNames = [BASE_ROLES.STAFF.name, BASE_ROLES.CHEF.name]
    for (const roleName of otherRoleNames) {
      const role = await prisma.role.findUnique({
        where: { name: roleName }
      })
      if (!role) continue

      const rule = ROLE_PERMISSION_RULES[roleName]
      let allowedPerms: typeof allPermissions = []

      if (rule) {
        allowedPerms = allPermissions.filter((p) => rule.modules.includes(p.module))
      }

      await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            set: allowedPerms.map((p) => ({ id: p.id }))
          }
        }
      })
      console.log(`  🛡️ [${roleName}]: Được gán ${allowedPerms.length} permissions thích hợp`)
    }

    console.log('\n🎉 Hoàn tất tự động khởi tạo và gán Permissions!')
    await app.close()
  } catch (error) {
    console.error('❌ Lỗi trong quá trình khởi tạo Permissions:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createPermissions()
