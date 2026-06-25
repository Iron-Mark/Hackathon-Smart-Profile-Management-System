const ACCOUNT_ROLES = ['admin', 'faculty'] as const

export type AccountRole = (typeof ACCOUNT_ROLES)[number]

export interface SeededDemoAccount {
  id: string
  role: AccountRole
  label: string
  name: string
  email: string
  password: string
}

export const PRIMARY_ADMIN_DEMO_ACCOUNT = {
  id: 'demo-admin-1',
  role: 'admin',
  label: 'Admin demo',
  name: 'Admin Reviewer',
  email: 'admin@umak.edu.ph',
  password: 'Admin123'
} as const satisfies SeededDemoAccount

export const PRIMARY_FACULTY_DEMO_ACCOUNT = {
  id: 'demo-faculty-1',
  role: 'faculty',
  label: 'Faculty demo',
  name: 'Dr. Maria Santos',
  email: 'faculty@umak.edu.ph',
  password: 'Faculty123'
} as const satisfies SeededDemoAccount

const ADDITIONAL_FACULTY_DEMO_ACCOUNTS = [
  {
    id: 'demo-faculty-2',
    role: 'faculty',
    label: 'Faculty seed',
    name: 'Prof. Daniel Reyes',
    email: 'daniel.reyes@umak.edu.ph',
    password: 'Faculty123'
  },
  {
    id: 'demo-faculty-3',
    role: 'faculty',
    label: 'Faculty seed',
    name: 'Dr. Liza Mercado',
    email: 'liza.mercado@umak.edu.ph',
    password: 'Faculty123'
  }
] as const satisfies readonly SeededDemoAccount[]

export const SEEDED_DEMO_ACCOUNTS = [
  PRIMARY_ADMIN_DEMO_ACCOUNT,
  PRIMARY_FACULTY_DEMO_ACCOUNT,
  ...ADDITIONAL_FACULTY_DEMO_ACCOUNTS
] as const satisfies readonly SeededDemoAccount[]

export const PUBLIC_DEMO_ACCOUNTS = [
  PRIMARY_FACULTY_DEMO_ACCOUNT,
  PRIMARY_ADMIN_DEMO_ACCOUNT
] as const

export const DASHBOARD_PATH_BY_ROLE: Record<AccountRole, string> = {
  admin: '/admin/dashboard',
  faculty: '/faculty/dashboard'
}

export function isAccountRole (value: unknown): value is AccountRole {
  return ACCOUNT_ROLES.includes(value as AccountRole)
}

export function getDashboardPathForRole (role?: string | null) {
  return isAccountRole(role) ? DASHBOARD_PATH_BY_ROLE[role] : null
}

export function getFallbackPathForRequiredRole (requiredRole: AccountRole) {
  return requiredRole === 'admin'
    ? DASHBOARD_PATH_BY_ROLE.faculty
    : DASHBOARD_PATH_BY_ROLE.admin
}
