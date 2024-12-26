import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/dream')({
  component: () => (
    <>
      <div>dream Layout</div>
      <Outlet />
    </>
  ),
})
