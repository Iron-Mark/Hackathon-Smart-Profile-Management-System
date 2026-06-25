import { expect, test } from 'vitest'
import { adminRoutes, appRoutes, facultyRoutes, publicRoutes } from './appRoutes'

test('keeps public, faculty, and admin route groups explicit', () => {
  expect(publicRoutes.map(route => route.path)).toEqual([
    '/',
    '/auth/login',
    '/auth/register',
    '/demo-storage/*'
  ])
  expect(facultyRoutes.every(route => route.requiredRole === 'faculty')).toBe(true)
  expect(adminRoutes.every(route => route.requiredRole === 'admin')).toBe(true)
})

test('exports all registered app routes in render order', () => {
  expect(appRoutes.map(route => route.path)).toEqual([
    ...publicRoutes.map(route => route.path),
    ...facultyRoutes.map(route => route.path),
    ...adminRoutes.map(route => route.path)
  ])
})
