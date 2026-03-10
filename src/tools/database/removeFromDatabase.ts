import supabase from '@/client/supabase'

interface RemoveParams {
  table: string
  match: Record<string, any>
}

export default async function removeFromDatabase ({
  table,
  match
}: RemoveParams): Promise<{ success: boolean }> {
  const { log, error: logError } = console

  const { error } = await supabase.from(table).delete().match(match)

  if (error) {
    logError('Error deleting from', table, ':', error.message)
    throw new Error(error.message)
  }

  log('Data deleted successfully from', table)
  return { success: true }
}
