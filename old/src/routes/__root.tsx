import type { AuthContextType } from '@/lib/providers/auth-provider'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'

type RouteContext = {
  auth: AuthContextType
}

export const Route = createRootRouteWithContext<RouteContext>()({

  component: () => (
    <>
      {/* <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
        <Link to="/dream" className="[&.active]:font-bold">
          Dream
        </Link>
        <Link to="/auth" className="[&.active]:font-bold">
          Auth
        </Link>
      </div>
      <hr /> */}
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
})