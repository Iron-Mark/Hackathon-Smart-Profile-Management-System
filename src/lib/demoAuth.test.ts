import { expect, test } from 'vitest'
import {
  DASHBOARD_PATH_BY_ROLE,
  PRIMARY_ADMIN_DEMO_ACCOUNT,
  PRIMARY_FACULTY_DEMO_ACCOUNT,
  PUBLIC_DEMO_ACCOUNTS,
  SEEDED_DEMO_ACCOUNTS,
  getDashboardPathForRole,
  getFallbackPathForRequiredRole,
  isAccountRole
} from './demoAuth'

test('exposes seeded demo accounts from one reusable source', () => {
  expect(PUBLIC_DEMO_ACCOUNTS).toEqual([
    PRIMARY_FACULTY_DEMO_ACCOUNT,
    PRIMARY_ADMIN_DEMO_ACCOUNT
  ])
  expect(SEEDED_DEMO_ACCOUNTS.map(account => account.id)).toEqual([
    'demo-admin-1',
    'demo-faculty-1',
    'demo-faculty-2',
    'demo-faculty-3'
  ])
})

test('maps supported roles to dashboards and fallback routes', () => {
  expect(DASHBOARD_PATH_BY_ROLE).toEqual({
    admin: '/admin/dashboard',
    faculty: '/faculty/dashboard'
  })
  expect(getDashboardPathForRole('faculty')).toBe('/faculty/dashboard')
  expect(getDashboardPathForRole('admin')).toBe('/admin/dashboard')
  expect(getDashboardPathForRole('inactive')).toBeNull()
  expect(getFallbackPathForRequiredRole('admin')).toBe('/faculty/dashboard')
  expect(getFallbackPathForRequiredRole('faculty')).toBe('/admin/dashboard')
})

test('narrows account role strings', () => {
  expect(isAccountRole('admin')).toBe(true)
  expect(isAccountRole('faculty')).toBe(true)
  expect(isAccountRole('owner')).toBe(false)
  expect(isAccountRole(undefined)).toBe(false)
})
