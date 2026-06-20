// loginUser.ts
import backend from '@/client/backend'
import type { DemoSession, DemoUser } from '@/client/demoBackend'
import getFromDatabase from '../database/getFromDatabase'
import { logAudit } from '../database/logAudit'

interface LoginResponse {
  success: boolean
  message?: string
  user?: DemoUser | null
  session?: DemoSession | null
}

export function getDashboardPathForAccountType(type?: string) {
  if (type === 'faculty') return '/faculty/dashboard'
  if (type === 'admin') return '/admin/dashboard'
  return null
}

const loginUser = async (
  email: string,
  password: string,
  navigate: (path: string) => void
): Promise<LoginResponse> => {
  try {
    const { data, error } = await backend.auth.signInWithPassword({
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

    const dashboardPath = getDashboardPathForAccountType(account[0].type)

    if (!dashboardPath) {
      throw new Error('Account role is not supported in demo mode')
    }

    await logAudit('LOGIN', `User logged in from ${email}`, userId);
    navigate(dashboardPath)

    return { success: true, user: data.user, session: data.session }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    const expectedAuthFailure =
      message.toLowerCase().includes('invalid demo credentials') ||
      message.toLowerCase().includes('invalid login credentials') ||
      message.toLowerCase().includes('email not confirmed')

    if (!expectedAuthFailure) {
      console.error('Login failed:', message)
    }

    return {
      success: false,
      message,
      user: null,
      session: null
    }
  }
}

export default loginUser
