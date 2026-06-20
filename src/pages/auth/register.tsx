import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Eye, EyeOff, UserRoundPlus } from 'lucide-react'
import demoAccountActions from '@/tools/accounts/demoAccountActions'
import { DemoAccessPanel } from '@/components/DemoAccessPanel'
import { ClerkAuthPanel } from '@/components/ClerkShowcaseControls'

export default function RegisterPage () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirm?: string
  }>({})
  const [registrationError, setRegistrationError] = useState<
    string | undefined
  >('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [demoMessage, setDemoMessage] = useState('')
  const navigate = useNavigate()

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = 'Full name is required.'
    }

    if (!email || !email.includes('@')) {
      newErrors.email = 'Enter a valid email address.'
    }

    if (
      password.length < 6 ||
      !/[0-9]/.test(password) ||
      !/[a-z]/i.test(password)
    ) {
      newErrors.password =
        'Password must be at least 6 characters and contain letters and numbers.'
    }

    if (confirmPassword !== password) {
      newErrors.confirm = 'Passwords do not match.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      try {
        setRegistrationError('')
        setDemoMessage('')
        const response = await demoAccountActions.signUpUser({
          email: email,
          password: password,
          name: name,
          type: 'faculty'
        })
        if (response.success) {
          window.sessionStorage.setItem('smart-profile-demo-login-email', email)
          navigate('/auth/login')
        } else if (!response.success) {
          const message = response.message || 'Registration failed. Please try again.'
          const isDuplicateEmail =
            message.toLowerCase().includes('already registered') ||
            message.includes('unique_email')
          setRegistrationError(isDuplicateEmail ? 'Email already registered' : message)
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        setRegistrationError(message || 'Registration failed. Please try again.')
      }
    }
  }

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-x-hidden bg-slate-950 px-4 py-8 pb-72 sm:pb-52 lg:pb-8'>
      <Card className='z-10 w-full max-w-md rounded-lg border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-sky-400/15 text-sky-200'>
            <UserRoundPlus className='h-6 w-6' />
          </div>
          <h2 className='text-3xl font-semibold tracking-tight'>Create Your Account</h2>
          <CardDescription className='text-slate-300'>
            Create a browser-local faculty account for this public demo only.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>

        <ClerkAuthPanel mode='register' />

        <DemoAccessPanel
          showSeedAccounts={false}
          message='Public demo registration accepts any valid email address. The account is saved only in this browser.'
          onReset={() => {
            setEmail('')
            setPassword('')
            setName('')
            setConfirmPassword('')
            setErrors({})
            setRegistrationError('')
            setDemoMessage('Demo data reset to the seeded showcase state.')
          }}
        />
        {demoMessage && (
          <p className='text-sm text-yellow-100' role='status'>
            {demoMessage}
          </p>
        )}

        <form className='space-y-4 text-white' onSubmit={handleSubmit}>
          <div>
            <Label htmlFor='name' className='mb-2'>
              Full Name
            </Label>
            <Input
              id='name'
              placeholder='Juan Dela Cruz'
              value={name}
              onChange={e => setName(e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby='name-error'
              className='mt-2 bg-white text-slate-950'
            />
            {errors.name && (
              <p id='name-error' className='text-sm text-red-400 mt-1'>
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='email' className='mb-2'>
              Email
            </Label>
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

          <div className='relative'>
            <Label htmlFor='password' className='mb-2'>
              Password
            </Label>
            <div className='flex items-center'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='********'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='mt-2 bg-white pr-12 text-slate-950'
                aria-invalid={Boolean(errors.password)}
                aria-describedby='password-error'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-2 top-6 flex min-h-11 min-w-11 items-center justify-center text-slate-500 hover:text-slate-950'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p id='password-error' className='text-sm text-red-400 mt-1'>
                {errors.password}
              </p>
            )}
          </div>

          <div className='relative'>
            <Label htmlFor='confirm-password' className='mb-2'>
              Confirm Password
            </Label>
            <div className='flex items-center'>
              <Input
                id='confirm-password'
                type={showConfirm ? 'text' : 'password'}
                placeholder='********'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className='mt-2 bg-white pr-12 text-slate-950'
                aria-invalid={Boolean(errors.confirm)}
                aria-describedby='confirm-error'
              />
              <button
                type='button'
                onClick={() => setShowConfirm(!showConfirm)}
                className='absolute right-2 top-6 flex min-h-11 min-w-11 items-center justify-center text-slate-500 hover:text-slate-950'
                aria-label={
                  showConfirm
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirm && (
              <p id='confirm-error' className='text-sm text-red-400 mt-1'>
                {errors.confirm}
              </p>
            )}
          </div>
          <p className='w-full text-left text-red-400'>{registrationError}</p>

          <Button
            type='submit'
            className='w-full min-h-11 scroll-mb-72 bg-emerald-500 text-emerald-950 hover:bg-emerald-400 sm:scroll-mb-52 lg:scroll-mb-8'
          >
            Register
          </Button>
        </form>

        <p className='text-sm text-center text-gray-400'>
          Already have an account?{' '}
          <Link
            to='/auth/login'
            className='inline-flex min-h-11 items-center text-emerald-200 transition hover:underline'
          >
            Login here
          </Link>
        </p>
        </CardContent>
      </Card>
    </div>
  )
}
