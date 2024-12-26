import { useAuth } from '@/lib/providers/auth-provider';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/')({
  component: Index,

})

function Index() {
  const router = useNavigate();
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return router({ to: '/auth' });
  }
  router({ to: '/dashboard' });
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  )
}
