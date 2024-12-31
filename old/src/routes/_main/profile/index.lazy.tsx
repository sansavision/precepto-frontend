import ProfilePage from '@/app/pages/(main)/profile'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_main/profile/')({
  component: ProfilePage,
})
