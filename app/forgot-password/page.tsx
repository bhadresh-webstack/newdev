'use client'

import type React from 'react'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Layers, Loader2, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Alert, AlertDescription } from '@/components/ui/alert'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
}

export default function ForgotPasswordPage () {
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { forgotPassword, isLoading, error, clearError } = useAuthStore()
  const { toast } = useToast()

  useEffect(() => {
    clearError()
  }, [])
  const validateForm = () => {
    if (!email) {
      setFormError('Email is required')
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address')
      return false
    }

    setFormError(null)
    return true
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    clearError()
    // Simulate API delay
    const res = await forgotPassword(email)
    if (!res.error) {
      setIsSubmitted(true)
      toast({
        title: 'Password reset email sent',
        description: 'Please check your email for a link to reset your password'
      })
    } else {
      setFormError(res.error)
    }
  }

  return (
    <div className='min-h-screen flex flex-col md:flex-row font-poppins'>
      <motion.div
        initial='hidden'
        animate='visible'
        variants={fadeIn}
        className='w-full md:w-1/2 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background p-8 flex flex-col justify-center relative overflow-hidden'
      >
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className='relative z-10'>
          <Link
            href='/login'
            className='inline-flex items-center mb-8 hover:text-primary transition-colors'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Login
          </Link>
          <div className='flex items-center gap-2 mb-6'>
            <Layers className='h-8 w-8 text-primary' />
            <span className='text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600'>
              Webstack
            </span>
          </div>
          <h1 className='text-3xl font-medium mb-4'>Reset your password</h1>
          <p className='text-muted-foreground mb-6 max-w-md font-light'>
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial='hidden'
        animate='visible'
        variants={fadeIn}
        className='w-full md:w-1/2 p-8 flex items-center justify-center'
      >
        <Card className='w-full max-w-md border-0 shadow-lg'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-medium'>
              Forgot Password
            </CardTitle>
            <CardDescription className='font-light'>
              Enter your email address and we'll send you a link to reset your
              password
            </CardDescription>
          </CardHeader>
          {isSubmitted ? (
            <CardContent className='space-y-4 text-center'>
              <div className='flex justify-center'>
                <div className='rounded-full bg-green-100 p-3'>
                  <svg
                    className='h-6 w-6 text-green-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    ></path>
                  </svg>
                </div>
              </div>
              <p className='text-lg font-medium'>Check your email</p>
              <p className='text-muted-foreground font-light'>
                We've sent a password reset link to {email}
              </p>
              <Button
                className='mt-4 w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal'
                onClick={() => setIsSubmitted(false)}
              >
                Back to reset password
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleResetPassword}>
              <CardContent className='space-y-4'>
                {(formError || error) && (
                  <Alert variant='destructive' className='mb-4'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>{formError || error}</AlertDescription>
                  </Alert>
                )}

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Input
                      id='email'
                      type='email'
                      placeholder='m@example.com'
                      className='transition-all border-muted-foreground/20 focus:border-primary'
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value)
                        setFormError(null)
                      }}
                      required
                    />
                  </motion.div>
                </div>
              </CardContent>
              <CardFooter className='flex flex-col space-y-4'>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='w-full'
                >
                  <Button
                    type='submit'
                    className='w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal'
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Sending reset link...
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </Button>
                </motion.div>
                <div className='text-center text-sm font-light'>
                  Remember your password?{' '}
                  <Link
                    href='/login'
                    className='text-primary hover:underline font-normal'
                  >
                    Back to login
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
