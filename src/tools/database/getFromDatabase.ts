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
  const { log } = console

  const query = getAll
    ? supabase.from(table).select().match(match)
    : supabase.from(table).select(column).match(match)

  const { data, error } = await query

  if (error) {
    log('Error:', error)
    throw new Error(error.message)
  }

  log('Data:', data)
  return data || []
}
