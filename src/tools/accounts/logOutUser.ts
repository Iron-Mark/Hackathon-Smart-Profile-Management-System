import backend from '@/client/backend'

interface LogoutResponse {
  success: boolean
  message?: string
}

const logOutUser = async (): Promise<LogoutResponse> => {
  try {
    const { error } = await backend.auth.signOut()

    if (error) {
      console.error('Error logging out:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true }
  } catch (error: unknown) {
    const err = error as Error
    console.error('Unexpected error:', err.message)
    return { success: false, message: err.message || 'An unknown error occurred' }
  }
}

export default logOutUser
