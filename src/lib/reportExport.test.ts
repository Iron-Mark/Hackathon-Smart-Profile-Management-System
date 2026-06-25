import { expect, test } from 'vitest'
import { filterRowsByDateRange } from './reportExport'

test('returns all rows when no date range is selected', () => {
  const rows = [{ id: 1 }, { id: 2 }]

  expect(filterRowsByDateRange(rows)).toBe(rows)
})

test('filters rows using supported date fields inclusively by day', () => {
  const rows = [
    { id: 1, submitted_at: new Date(2026, 5, 20, 10).toISOString() },
    { id: 2, timestamp: new Date(2026, 5, 21, 23, 59).toISOString() },
    { id: 3, created_at: new Date(2026, 5, 22, 0, 1).toISOString() },
    { id: 4 }
  ]

  expect(
    filterRowsByDateRange(rows, {
      from: new Date(2026, 5, 20),
      to: new Date(2026, 5, 21)
    }).map(row => row.id)
  ).toEqual([1, 2])
})

test('supports single-day filtering when only a start date is selected', () => {
  const rows = [
    { id: 1, submitted_at: new Date(2026, 5, 20, 8).toISOString() },
    { id: 2, submitted_at: new Date(2026, 5, 21, 8).toISOString() }
  ]

  expect(
    filterRowsByDateRange(rows, {
      from: new Date(2026, 5, 20)
    }).map(row => row.id)
  ).toEqual([1])
})
