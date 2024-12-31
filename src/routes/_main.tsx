import { Page404 } from '@/components/404'
// import { MainLayout } from '@/lib/layout/main.layout'
import {MainLayout} from '@/lib/layout/main.layout'
import { createFileRoute, redirect } from '@tanstack/react-router'


export const Route = createFileRoute('/_main')({
  beforeLoad: ({context}) => {
    const { auth } = context
    if (!auth?.isAuthenticated) {
      throw redirect({to: '/auth'})
    //   const refresh_token = localStorage.getItem('refresh_token')
    //   if (!refresh_token) {
    //     throw redirect({to: '/auth'})
    //   }
    //   throw redirect({to: '/auth'})
    }
  },
  notFoundComponent: Page404,
  // component:  MainLayout,
  component:  MainLayout,

})
 