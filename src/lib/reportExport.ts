export interface DateRangeFilter {
  from?: Date
  to?: Date
}

const DEFAULT_DATE_FIELDS = ['submitted_at', 'created_at', 'timestamp', 'updated_at']

function startOfDay (date: Date) {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function endOfDay (date: Date) {
  const nextDate = new Date(date)
  nextDate.setHours(23, 59, 59, 999)
  return nextDate
}

function getFirstValidDate (
  row: Record<string, unknown>,
  dateFields: readonly string[]
) {
  for (const field of dateFields) {
    const value = row[field]
    if (!value) continue

    const parsed = new Date(String(value))
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return null
}

export function filterRowsByDateRange<T extends Record<string, unknown>> (
  rows: T[],
  range?: DateRangeFilter,
  dateFields: readonly string[] = DEFAULT_DATE_FIELDS
) {
  if (!range?.from) {
    return rows
  }

  const from = startOfDay(range.from)
  const to = endOfDay(range.to || range.from)

  return rows.filter(row => {
    const rowDate = getFirstValidDate(row, dateFields)
    if (!rowDate) return false

    return rowDate >= from && rowDate <= to
  })
}
