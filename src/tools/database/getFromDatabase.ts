import supabase from '@/client/supabase.ts'

export default async function getFromDatabase ({
  table,
  column,
  getAll = false,
  match
}: {
  table: string
  column?: string
  getAll: boolean
  match: object
}): Promise<any[]> {
  const query = getAll
    ? supabase.from(table).select().match(match)
    : supabase.from(table).select(column).match(match)

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching from ${table}:`, error.message)
    throw new Error(error.message)
  }

  return data || []
}
