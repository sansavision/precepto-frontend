import { AuthLayout } from '@/lib/layout/auth.layout'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({

  beforeLoad: ({context}) => {
    const { auth } = context
    console.info('auth', auth)
    if (auth?.isAuthenticated) {
      throw redirect({to: '/dashboard'})
    }
  },
  component:AuthLayout
})