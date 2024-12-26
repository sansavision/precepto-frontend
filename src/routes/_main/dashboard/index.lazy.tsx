import Dashboard from '@/app/pages/(main)/dashboard'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_main/dashboard/')({
  component: Dashboard,
})
