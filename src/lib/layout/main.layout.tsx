import { AppSidebar } from '@/components/app-sidebar';
import { BreadcrumbComponent } from '@/components/breadcrums';
import { ThemeProvider } from '@/components/theme-provider';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { X } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
// import { NatsProvider } from '../providers/nats-provider';
import { Meta } from './components/meta';

export const MainLayout = () => {
  const location = useLocation();
  const router = useNavigate();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="precepto-ui-theme">
      <Toaster />
      <Meta />
      <SidebarProvider
        style={
          {
            '--sidebar-width': '350px',
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <BreadcrumbComponent path={location.pathname} />
            <div className="flex items-center justify-end flex-1 md:pr-8">
              {
                location.pathname === '/dashboard' ? null : (<X
                  onClick={() => router({ to: '/' })}
                  className="h-4 w-4 hover:cursor-pointer hover:scale-105"
                />)
              }

            </div>
          </header>
          <div className="flex flex-1">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>

    </ ThemeProvider>
  );
};
