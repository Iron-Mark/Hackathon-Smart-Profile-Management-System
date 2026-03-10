import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import supabaseAccountActions from '@/tools/accounts/supabaseAccountActions'

export default function RegisterPage () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirm?: string
  }>({})
  const [registrationError, setRegistrationError] = useState<
    string | undefined
  >('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!email.endsWith('@umak.edu.ph')) {
      newErrors.email = 'Email must end with @umak.edu.ph'
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
        const response = await supabaseAccountActions.signUpUser({
          email: email,
          password: password,
          name: name,
          type: 'faculty'
        })
        if (response.success) {
          navigate('/auth/login')
        } else if (!response.success) {
          switch (response.message) {
            case `duplicate key value violates unique constraint "unique_email"`:
              setRegistrationError('Email already registered')
              break
          }
        }
      } catch (error: any) {
        setRegistrationError(error)
        console.log(error)
      }
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-950 via-black to-yellow-900 relative overflow-hidden'>
      {/* Glowing blobs */}
      <div className='absolute w-72 h-72 bg-green-600 opacity-30 rounded-full filter blur-3xl top-10 left-10 animate-pulse' />
      <div className='absolute w-64 h-64 bg-yellow-400 opacity-20 rounded-full filter blur-2xl bottom-10 right-10 animate-pulse' />

      <div className='w-full max-w-md border border-green-800 rounded-2xl p-8 backdrop-blur-md bg-black/50 shadow-[0_0_40px_rgba(0,255,0,0.1)] space-y-6 z-10'>
        <h2 className='text-3xl font-bold text-center text-white drop-shadow-md'>
          Create Your Account
        </h2>

        <form className='space-y-4 text-white' onSubmit={handleSubmit}>
          <div>
            <Label htmlFor='name' className='mb-2'>
              Full Name
            </Label>
            <Input
              id='name'
              placeholder='Juan Dela Cruz'
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor='email' className='mb-2'>
              UMak Email
            </Label>
            <Input
              id='email'
              type='email'
              placeholder='you@umak.edu.ph'
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-describedby='email-error'
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
                className='pr-10'
                aria-describedby='password-error'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3  text-gray-400 hover:text-white cursor-pointer'
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
                className='pr-10'
                aria-describedby='confirm-error'
              />
              <button
                type='button'
                onClick={() => setShowConfirm(!showConfirm)}
                className='absolute right-3 text-gray-400 hover:text-white cursor-pointer'
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
            className='w-full hover:shadow-[0_0_20px_#22c55e] transition'
          >
            Register
          </Button>
        </form>

        <p className='text-sm text-center text-gray-400'>
          Already have an account?{' '}
          <Link
            to='/auth/login'
            className='text-yellow-300 hover:underline transition'
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
