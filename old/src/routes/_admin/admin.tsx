import AdminPage from '@/app/(admin)/admin'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/_admin/admin')({
  component: AdminPage,
})
