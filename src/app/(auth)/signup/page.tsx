import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Sign Up | HealthCRM',
}

export default function SignupPage() {
  return <SignupForm />
}
