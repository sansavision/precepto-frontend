import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/auth-provider';

type PrivateRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export const RequireAuth = ({
  children,
  redirectTo = '/login',
}: PrivateRouteProps) => {
  // add your own authentication logic here
  // const isAuthenticated = true;
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    (children as React.ReactElement)
  ) : (
    <Navigate to={redirectTo} />
  );
};

// import React from 'react';
// import { useAuth } from '../auth/AuthProvider';
// import { Redirect, Route } from 'react-router-dom';

// const ProtectedRoute = ({ component: Component, ...rest }: any) => {
//   const { isAuthenticated } = useAuth();

//   return (
//     <Route
//       {...rest}
//       render={(props: any) =>
//         isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />
//       }
//     />
//   );
// };

// export default ProtectedRoute;
