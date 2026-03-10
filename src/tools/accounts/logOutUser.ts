import supabase from '@/client/supabase'

interface LogoutResponse {
  success: boolean
  message?: string
}

const logOutUser = async (): Promise<LogoutResponse> => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error logging out:', error.message)
      return { success: false, message: error.message }
    }

    console.log('User logged out successfully')
    return { success: true }
  } catch (error: unknown) {
    const err = error as Error
    console.error('Unexpected error:', err.message)
    return { success: false, message: err.message || 'An unknown error occurred' }
  }
}

export default logOutUser
