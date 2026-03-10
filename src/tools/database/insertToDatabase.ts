import supabase from '@/client/supabase.ts'

export default async function insertToDatabase ({
  table,
  data
}: {
  table: string
  data: object
}): Promise<object> {
  const { log } = console

  const { error } = await supabase.from(table).insert(data)

  if (error) {
    log('Error:', error)
    throw new Error(error.message)
  }

  log('Data inserted successfully')
  return { success: true }
}
