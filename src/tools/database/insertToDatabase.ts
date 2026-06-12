import supabase from '@/client/supabase.ts'

export default async function insertToDatabase ({
  table,
  data
}: {
  table: string
  data: object
}): Promise<object> {
  const { error } = await supabase.from(table).insert(data)

  if (error) {
    console.error('Error inserting data:', error.message)
    throw new Error(error.message)
  }

  return { success: true }
}
