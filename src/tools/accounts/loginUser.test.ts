import { expect, test } from 'vitest'
import { getDashboardPathForAccountType } from './loginUser'

test('maps supported account roles to known dashboard routes', () => {
  expect(getDashboardPathForAccountType('faculty')).toBe('/faculty/dashboard')
  expect(getDashboardPathForAccountType('admin')).toBe('/admin/dashboard')
})

test('rejects unsupported account roles instead of creating unknown routes', () => {
  expect(getDashboardPathForAccountType('inactive')).toBeNull()
  expect(getDashboardPathForAccountType('')).toBeNull()
  expect(getDashboardPathForAccountType(undefined)).toBeNull()
})
