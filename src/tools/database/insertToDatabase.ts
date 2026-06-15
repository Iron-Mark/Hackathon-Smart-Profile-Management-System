import backend from '@/client/backend'

export default async function insertToDatabase ({
  table,
  data
}: {
  table: string
  data: object
}): Promise<object> {
  const { error } = await backend.from(table).insert(data)

  if (error) {
    console.error('Error inserting data:', error.message)
    throw new Error(error.message)
  }

  return { success: true }
}
