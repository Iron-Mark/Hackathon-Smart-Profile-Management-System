import { expect, test } from 'vitest'
import { cn } from '../lib/utils'

test('cn merges tailwind classes correctly', () => {
  expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  expect(cn('px-2', 'p-4')).toBe('p-4')
  expect(cn('text-red-500', 'hover:text-blue-500')).toBe('text-red-500 hover:text-blue-500')
})
