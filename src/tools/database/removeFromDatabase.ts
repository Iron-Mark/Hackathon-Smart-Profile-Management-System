import backend from '@/client/backend'

interface RemoveParams {
  table: string
  match: Record<string, any>
}

export default async function removeFromDatabase ({
  table,
  match
}: RemoveParams): Promise<{ success: boolean }> {
  const { error } = await backend.from(table).delete().match(match)

  if (error) {
    console.error(`Error deleting from ${table}:`, error.message)
    throw new Error(error.message)
  }

  return { success: true }
}
