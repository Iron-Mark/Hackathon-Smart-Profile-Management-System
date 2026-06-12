import supabase from '@/client/supabase'

interface UpdateParams {
  table: string
  data: Record<string, any>
  match: Record<string, any>
}

export default async function updateDatabase ({
  table,
  data,
  match
}: UpdateParams): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from(table)
    .update(data)
    .match(match)

  if (error) {
    console.error(`Error updating ${table}:`, error.message)
    throw new Error(error.message)
  }

  return { success: true }
}
