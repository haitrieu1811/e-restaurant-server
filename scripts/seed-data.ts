import { PrismaPg } from '@prisma/adapter-pg'

import envConfig from '@/shared/constants/config.js'
import { PrismaClient } from '@/generated/prisma/client.js'
import { BASE_ROLES } from '@/shared/constants/auth.js'
import { HashingService } from '@/shared/services/hashing.service.js'

const adapter = new PrismaPg({
  connectionString: envConfig.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })
const hashingService = new HashingService()

async function initSeedData() {
  console.log('🚀 Bắt đầu khởi tạo dữ liệu mẫu (Seed Data)...')

  try {
    const validRoleNames = Object.values(BASE_ROLES).map((role) => role.name)

    // 1. Khởi tạo / Cập nhật các Base Roles
    console.log('📦 Khởi tạo và cập nhật các vai trò cơ bản (Base Roles)...')
    const roleMap = new Map<string, number>()

    for (const roleObj of Object.values(BASE_ROLES)) {
      let role = await prisma.role.findUnique({
        where: { name: roleObj.name }
      })

      if (!role) {
        role = await prisma.role.create({
          data: {
            name: roleObj.name,
            description: roleObj.description
          }
        })
        console.log(`  ✅ Đã tạo vai trò mới: ${roleObj.name}`)
      } else {
        if (role.description !== roleObj.description) {
          role = await prisma.role.update({
            where: { id: role.id },
            data: { description: roleObj.description }
          })
          console.log(`  🔄 Đã cập nhật mô tả vai trò: ${roleObj.name}`)
        } else {
          console.log(`  ℹ️ Vai trò đã hợp lệ: ${roleObj.name}`)
        }
      }

      roleMap.set(roleObj.name, role.id)
    }

    // 2. Dọn dẹp / Xóa các vai trò không còn nằm trong BASE_ROLES
    console.log('🧹 Dọn dẹp các vai trò không còn nằm trong BASE_ROLES...')
    const obsoleteRoles = await prisma.role.findMany({
      where: {
        name: {
          notIn: validRoleNames
        }
      }
    })

    if (obsoleteRoles.length > 0) {
      for (const role of obsoleteRoles) {
        try {
          await prisma.role.delete({
            where: { id: role.id }
          })
          console.log(`  🗑️ Đã xóa vai trò dư thừa: ${role.name}`)
        } catch (error) {
          console.warn(`  ⚠️ Không thể xóa vai trò "${role.name}" do đang có người dùng liên kết.`)
        }
      }
    } else {
      console.log('  ✨ Không có vai trò dư thừa cần xóa.')
    }

    // 3. Khởi tạo tài khoản Admin từ .env
    console.log('👤 Khởi tạo tài khoản Admin...')
    const adminRoleId = roleMap.get(BASE_ROLES.ADMIN.name)
    if (!adminRoleId) {
      throw new Error('Không tìm thấy vai trò ADMIN trong CSDL')
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: envConfig.ADMIN_EMAIL }
    })

    const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD)

    if (!existingAdmin) {
      const admin = await prisma.user.create({
        data: {
          email: envConfig.ADMIN_EMAIL,
          name: envConfig.ADMIN_NAME,
          password: hashedPassword,
          roleId: adminRoleId,
          isActive: true
        }
      })
      console.log(`  ✅ Đã tạo tài khoản Admin: ${admin.email} (Tên: ${admin.name})`)
    } else {
      await prisma.user.update({
        where: { email: envConfig.ADMIN_EMAIL },
        data: {
          name: envConfig.ADMIN_NAME,
          password: hashedPassword,
          roleId: adminRoleId,
          isActive: true
        }
      })
      console.log(`  🔄 Đã cập nhật lại thông tin tài khoản Admin: ${envConfig.ADMIN_EMAIL}`)
    }

    console.log('🎉 Khởi tạo dữ liệu mẫu hoàn tất thành công!')
  } catch (error) {
    console.error('❌ Lỗi trong quá trình seed data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initSeedData()
