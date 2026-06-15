import backend from '@/client/backend'

const changePassword = async (newPassword: string) => {
  try {
    const {
      data: { user },
      error: userError
    } = await backend.auth.getUser()

    if (userError || !user) {
      return { success: false, message: 'User not authenticated' }
    }

    const { error } = await backend.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Error changing password:', error.message)
      return { success: false, message: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error.message || error)
    return {
      success: false,
      message: error.message || 'An unknown error occurred'
    }
  }
}

export default changePassword
