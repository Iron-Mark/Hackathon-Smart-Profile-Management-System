import backend from '@/client/backend'

export type DatabaseRow = Record<string, any>

export default async function getFromDatabase<T extends DatabaseRow = any> ({
  table,
  column,
  getAll = false,
  match
}: {
  table: string
  column?: string
  getAll: boolean
  match: object
}): Promise<T[]> {
  const query = getAll
    ? backend.from(table).select().match(match)
    : backend.from(table).select(column).match(match)

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching from ${table}:`, error.message)
    throw new Error(error.message)
  }

  return (data || []) as T[]
}
