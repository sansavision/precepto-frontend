import { AdminLayout } from '@/lib/layout/admin.layout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin')({
  component: AdminLayout
})
