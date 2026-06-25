import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import type { AccountRole } from '@/lib/demoAuth'

const Landing = lazy(() => import('@/pages/landing'))
const Login = lazy(() => import('@/pages/auth/login'))
const Register = lazy(() => import('@/pages/auth/register'))
const FacultyDashboard = lazy(() => import('@/pages/faculty/dashboard'))
const ProfilePage = lazy(() => import('@/pages/faculty/profile'))
const FacultyFiles = lazy(() => import('@/pages/faculty/uploaded'))
const SettingsPage = lazy(() => import('@/pages/faculty/settings'))
const AdminDashboard = lazy(() => import('@/pages/admin/dashboard'))
const AdminAccountsPage = lazy(() => import('@/pages/admin/accounts'))
const AdminApprovalsPage = lazy(() => import('@/pages/admin/approvals'))
const AdminAuditLogsPage = lazy(() => import('@/pages/admin/audit-logs'))
const AdminReportsPage = lazy(() => import('@/pages/admin/reports'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/settings'))
const AdminHelpPage = lazy(() => import('@/pages/admin/help'))
const DemoStoragePreview = lazy(() => import('@/pages/demo-storage'))

export interface AppRouteConfig {
  path: string
  Component: LazyExoticComponent<ComponentType>
  requiredRole?: AccountRole
}

export function renderRouteElement ({ Component, requiredRole }: AppRouteConfig) {
  const element = <Component />

  return requiredRole
    ? <ProtectedRoute requiredRole={requiredRole}>{element}</ProtectedRoute>
    : element
}

export const publicRoutes: AppRouteConfig[] = [
  { path: '/', Component: Landing },
  { path: '/auth/login', Component: Login },
  { path: '/auth/register', Component: Register },
  { path: '/demo-storage/*', Component: DemoStoragePreview }
]

export const facultyRoutes: AppRouteConfig[] = [
  {
    path: '/faculty/dashboard',
    Component: FacultyDashboard,
    requiredRole: 'faculty'
  },
  {
    path: '/faculty/profile',
    Component: ProfilePage,
    requiredRole: 'faculty'
  },
  {
    path: '/faculty/uploaded',
    Component: FacultyFiles,
    requiredRole: 'faculty'
  },
  {
    path: '/faculty/settings',
    Component: SettingsPage,
    requiredRole: 'faculty'
  }
]

export const adminRoutes: AppRouteConfig[] = [
  {
    path: '/admin/dashboard',
    Component: AdminDashboard,
    requiredRole: 'admin'
  },
  {
    path: '/admin/accounts',
    Component: AdminAccountsPage,
    requiredRole: 'admin'
  },
  {
    path: '/admin/approvals',
    Component: AdminApprovalsPage,
    requiredRole: 'admin'
  },
  {
    path: '/admin/audit-logs',
    Component: AdminAuditLogsPage,
    requiredRole: 'admin'
  },
  {
    path: '/admin/reports',
    Component: AdminReportsPage,
    requiredRole: 'admin'
  },
  {
    path: '/admin/settings',
    Component: AdminSettingsPage,
    requiredRole: 'admin'
  },
  {
    path: '/admin/help',
    Component: AdminHelpPage,
    requiredRole: 'admin'
  }
]

export const appRoutes: AppRouteConfig[] = [
  ...publicRoutes,
  ...facultyRoutes,
  ...adminRoutes
]
