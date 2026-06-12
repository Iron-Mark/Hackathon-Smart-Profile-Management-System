import supabase from '@/client/supabase'

const changePassword = async (newPassword: string) => {
  try {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, message: 'User not authenticated' }
    }

    const { error } = await supabase.auth.updateUser({
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
