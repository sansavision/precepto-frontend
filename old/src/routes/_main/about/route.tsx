import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/about')({
  component: () => (
    <>
      <div>about Layout</div>
      <Outlet />
    </>
  ),
})
