import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import supabaseAccountActions from '@/tools/accounts/supabaseAccountActions'
import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/use-document-title'

export default function LoginPage () {
  useDocumentTitle('Login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [loginError, setLoginError] = useState<string>('')

  const navigate = useNavigate()
  const validate = () => {
    const newErrors: typeof errors = {}

    if (!email.endsWith('@umak.edu.ph')) {
      newErrors.email = 'Email must end with @umak.edu.ph'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      try {
        const response = await supabaseAccountActions.loginUser(
          email,
          password,
          navigate
        )

        if (!response.success) {
          setLoginError(response.message || 'Login failed')
        }
      } catch (error: any) {
        setLoginError(error.message || 'An unexpected error occurred')
      }
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-950 via-black to-yellow-900 relative overflow-hidden'>
      {/* background blobs */}
      <div className='absolute w-72 h-72 bg-green-600 opacity-30 rounded-full filter blur-3xl top-10 left-10 animate-pulse' />
      <div className='absolute w-64 h-64 bg-yellow-400 opacity-20 rounded-full filter blur-2xl bottom-10 right-10 animate-pulse' />

      <div className='w-full max-w-md border border-green-800 rounded-2xl p-8 backdrop-blur-md bg-black/50 shadow-[0_0_40px_rgba(0,255,0,0.1)] space-y-6 z-10 text-white'>
        <h2 className='text-3xl font-bold text-center drop-shadow-md'>
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <Label htmlFor='email'>UMak Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='you@umak.edu.ph'
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-describedby='email-error'
              className='mt-2'
            />
            {errors.email && (
              <p id='email-error' className='text-sm text-red-400 mt-1'>
                {errors.email}
              </p>
            )}
          </div>

          <div className='relative w-full'>
            <Label htmlFor='password' className='mb-2 block text-white'>
              Password
            </Label>
            <div className='flex items-center'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='********'
                value={password}
                onChange={e => setPassword(e.target.value)}
                aria-describedby='password-error'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 text-gray-400 hover:text-white'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p id='password-error' className='text-sm text-red-400 mt-1'>
                {errors.password}
              </p>
            )}
          </div>
          {loginError && <p className='text-red-400'>{loginError}</p>}
          <Button
            className='w-full hover:cursor-pointer hover:shadow-[0_0_20px_#22c55e] transition'
            type='submit'
          >
            Login
          </Button>
        </form>

        <p className='text-sm text-center text-gray-400'>
          Don’t have an account?{' '}
          <button
            onClick={() => {
              navigate('/auth/register')
            }}
            className='text-yellow-300 hover:underline transition'
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  )
}
