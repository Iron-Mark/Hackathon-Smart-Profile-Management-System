import supabase from '@/client/supabase'
import type { User, Session } from '@supabase/supabase-js'
import insertToDatabase from '../database/insertToDatabase'

interface SignUpResponse {
  success: boolean
  message?: string
  user?: User | null
  session?: Session | null
}

const signUpUser = async ({
  email,
  password,
  name,
  type
}: {
  email: string
  password: string
  name: string
  type: string
}): Promise<SignUpResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      const expectedDuplicateEmail =
        error.message.toLowerCase().includes('already registered') ||
        error.message.includes('unique_email')
      if (!expectedDuplicateEmail) {
        console.error('Error signing up:', error.message)
      }
      return { success: false, message: error.message }
    }

    const response = await insertToDatabase({
      table: 'account_details',
      data: {
        type: type,
        name: name,
        email: email,
        id: data.user?.id
      }
    })

    const result = await insertToDatabase({
      table: 'profile_details',
      data: {
        id: data.user?.id
      }
    })

    if (response && result) {
      supabase.auth.signOut()
    }

    return { success: true, user: data.user, session: data.session }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An unknown error occurred'
    }
  }
}

export default signUpUser
