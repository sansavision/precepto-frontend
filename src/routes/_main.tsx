import { Page404 } from '@/components/404'
import { MainLayout } from '@/lib/layout/main.layout'
import { createFileRoute, redirect } from '@tanstack/react-router'


export const Route = createFileRoute('/_main')({
  beforeLoad: ({context}) => {
    const { auth } = context
    console.info('auth', auth)
    if (!auth?.isAuthenticated) {
      throw redirect({to: '/auth'})
    }
  },
  notFoundComponent: Page404,
  component:  MainLayout,

})
