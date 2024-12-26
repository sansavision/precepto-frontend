import type { ReactNode } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { BreadcrumbComponent } from '@/components/breadcrums';
// import { ThemeProvider } from 'next-themes';
import { ThemeProvider } from '@/components/theme-provider';
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NatsProvider } from '../providers/nats-provider';
// import { Footer } from './components/footer';
// import { Header } from './components/header';
import { Meta } from './components/meta';

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const router = useNavigate();
  return (
    <NatsProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
                <X
                  onClick={() => router('/')}
                  className="h-4 w-4 hover:cursor-pointer hover:scale-105"
                />
              </div>
            </header>
            <div className="flex flex-1">
              {children}
              {/* <main className="wrapper">{children}</main> */}
              {/* {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              className="aspect-video h-12 w-full rounded-lg bg-muted/50"
            />
          ))} */}
            </div>
          </SidebarInset>
        </SidebarProvider>
        {/* <div className="flex min-h-screen flex-col dark:bg-black dark:text-white">
        <Header />
        <main className="wrapper">{children}</main>
        <Footer />
      </div> */}
      </ThemeProvider>
    </NatsProvider>
  );
};
