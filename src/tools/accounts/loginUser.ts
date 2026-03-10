// loginUser.ts
import supabase from '@/client/supabase'
import type { User, Session } from '@supabase/supabase-js'
import getFromDatabase from '../database/getFromDatabase'

interface LoginResponse {
  success: boolean
  message?: string
  user?: User | null
  session?: Session | null
}

const loginUser = async (
  email: string,
  password: string,
  navigate: (path: string) => void
): Promise<LoginResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(`Login failed: ${error.message}`)
    }

    const account = await getFromDatabase({
      table: 'account_details',
      getAll: false,
      column: 'type',
      match: { email }
    })

    if (!account || account.length === 0) {
      throw new Error('Account info could not be fetched')
    }

    const userId = data.user?.id
    if (!userId) {
      throw new Error('User ID not found')
    }

    console.log('User logged in successfully:', data.user)
    navigate(`/${account[0].type}/dashboard/`)

    return { success: true, user: data.user, session: data.session }
  } catch (err: any) {
    console.error('Login failed:', err.message)
    return {
      success: false,
      message: err.message || 'An unexpected error occurred',
      user: null,
      session: null
    }
  }
}

export default loginUser
