export const BASE_ROLES = {
  ADMIN: {
    name: 'ADMIN',
    description: 'Quản trị viên hệ thống có toàn quyền truy cập'
  },
  STAFF: {
    name: 'STAFF',
    description: 'Nhân viên phục vụ quản lý bàn và đơn hàng'
  },
  CHEF: {
    name: 'CHEF',
    description: 'Nhân viên bếp / pha chế chế biến món ăn'
  }
} as const

export type BaseRole = keyof typeof BASE_ROLES
