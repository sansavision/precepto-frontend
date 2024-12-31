// import { BrowserRouter as Router } from 'react-router-dom';

// import { Layout } from '@/lib/layout';
// import { Routings } from '@/lib/router/routings';

import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { useAuth } from './lib/providers/auth-provider';
import { useNats } from './lib/providers/nats-provider';

// Create a new router instance
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const router = createRouter({ routeTree, context: { auth: undefined! } })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}


const App = () => {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />

}
export const AppIntializer = () => {
  const { isConnected } = useNats();
  if (!isConnected) {
    return <div className='h-screen w-screen bg-black'> LOADING</div>;
  }
  return <App />;
}
// <Router>
//   <Layout>
//     <Routings />
//   </Layout>
// </Router>

