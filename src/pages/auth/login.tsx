import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import demoAccountActions from '@/tools/accounts/demoAccountActions'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { DemoAccessPanel } from '@/components/DemoAccessPanel'
import { ClerkAuthPanel } from '@/components/ClerkShowcaseControls'

export default function LoginPage () {
  useDocumentTitle('Login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [demoMessage, setDemoMessage] = useState('')
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [loginError, setLoginError] = useState<string>('')

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const resetMessage = window.sessionStorage.getItem('smart-profile-demo-reset-message')
    if (resetMessage) {
      window.sessionStorage.removeItem('smart-profile-demo-reset-message')
      setDemoMessage(resetMessage)
    }

    const registeredEmail = window.sessionStorage.getItem('smart-profile-demo-login-email')
    if (registeredEmail) {
      window.sessionStorage.removeItem('smart-profile-demo-login-email')
      setEmail(registeredEmail)
      setLoginError('')
      setDemoMessage(`${registeredEmail} is ready to sign in.`)
    }

    if (searchParams.get('demo') === 'faculty') {
      setEmail('faculty@umak.edu.ph')
      setPassword('Faculty123')
      setLoginError('')
      setDemoMessage('faculty@umak.edu.ph is ready to sign in.')
    }
  }, [searchParams])

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!email || !email.includes('@')) {
      newErrors.email = 'Enter a valid email address.'
    }

    if (!password) {
      newErrors.password = 'Password is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      try {
        const response = await demoAccountActions.loginUser(
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
    <div className='relative flex min-h-screen items-center justify-center overflow-x-hidden bg-slate-950 px-4 py-8 pb-72 text-white sm:pb-52 lg:pb-8'>
      <Card className='z-10 w-full max-w-md rounded-lg border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-emerald-400/15 text-emerald-200'>
            <ShieldCheck className='h-6 w-6' />
          </div>
          <h2 className='text-3xl font-semibold tracking-tight'>Welcome Back</h2>
          <CardDescription className='text-slate-300'>
            Sign in with seeded reviewer credentials or a browser-local demo account.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>

        <ClerkAuthPanel mode='login' />

        <DemoAccessPanel
          onUseAccount={account => {
            setEmail(account.email)
            setPassword(account.password)
            setLoginError('')
            setDemoMessage(`${account.email} is ready to sign in.`)
          }}
          onReset={() => {
            setEmail('')
            setPassword('')
            setErrors({})
            setLoginError('')
            setDemoMessage('Demo data reset to the seeded showcase state.')
          }}
        />
        {demoMessage && (
          <p className='text-sm text-yellow-100' role='status'>
            {demoMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='name@example.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby='email-error'
              className='mt-2 bg-white text-slate-950'
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
                aria-invalid={Boolean(errors.password)}
                aria-describedby='password-error'
                className='bg-white pr-12 text-slate-950'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-2 flex min-h-11 min-w-11 items-center justify-center text-slate-500 hover:text-slate-950'
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
            className='w-full min-h-11 scroll-mb-72 bg-emerald-500 text-emerald-950 hover:bg-emerald-400 sm:scroll-mb-52 lg:scroll-mb-8'
            type='submit'
          >
            Login
          </Button>
        </form>

        <p className='text-sm text-center text-gray-400'>
          Don’t have an account?{' '}
          <button
            type='button'
            onClick={() => {
              navigate('/auth/register')
            }}
            className='min-h-11 text-emerald-200 transition hover:underline'
          >
            Register here
          </button>
        </p>
        </CardContent>
      </Card>
    </div>
  )
}
