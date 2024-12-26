import { ThemeProvider } from '@/components/theme-provider';


import { Toaster } from '@/components/ui/sonner';

import {
  Outlet,
  // useLocation, useNavigate 
} from '@tanstack/react-router';
// import { NatsProvider } from '../providers/nats-provider';
import { Meta } from './components/meta';

export const AuthLayout = () => {
  // const location = useLocation();
  // const router = useNavigate();
  return (

    <ThemeProvider defaultTheme="dark" storageKey="precepto-ui-theme">
      <Toaster />
      <Meta />
      <div className="flex flex-1">
        <Outlet />
      </div>
    </ThemeProvider>

  );
};
