import LoginPage from '@/app/pages/(auth)/login'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/auth')({
  component: LoginPage,
})
