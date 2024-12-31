import { AppSidebar } from "../../components/layout/sidebar";
import { SidebarInner } from "../../components/layout/sidebar-inner";
import { Menu, PanelRight, PanelLeft, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { Meta } from './components/meta';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { useGlobalStore } from "../store/globalstore";
import { useShallow } from "zustand/shallow";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BreadcrumbComponent from "@/components/breadcrums";
// import { useTemplates } from "@/hooks/use-templates";
// import { useTranscriptions } from "@/hooks/use-transcriptions";
// import type { TranscriptionMeta, TranscriptTemplate } from "../types/transcript.types";


// const convertPathIdToTitle = (path: string, activeItem: string, templates: TranscriptTemplate[] | null, _transcriptions?: TranscriptionMeta[] | null) => {
//   console.info('convertPathIdToTitle', path, activeItem, templates);
//   if (activeItem === "Maler" && templates?.length) {
//     // console.info("case 1 - Maler");
//     const pathId = path.split('/').pop();
//     if (pathId?.includes("-")) {
//       // const pathBase = path.split('/')[1];
//       // console.info('pathBase', pathBase, 'pathId', pathId);
//       const template = templates.find(t => t.id === pathId);
//       // console.info('found template', template);
//       // console.info("final path", `${pathBase}/${template?.name}`)
//       // return `/${pathBase}/${template?.name}`;
//       return "test";
//     }
//     return path;
//   }
  // if (activeItem === "Ikke Signert" && transcriptions?.length) {
  //   const pathBase = path.split('/')[0];
  //   const pathId = path.split('/').pop();
  //   if (pathId?.includes("-")) {
  //     const transcription = transcriptions.find(t => t.id === pathId);
  //     return `${pathBase}/${transcription?.name}`;
  //   }
  //   return path;
  // }
  // return path;
// }

export function MainLayout() {
  const router = useNavigate();
  // const { templates } = useTemplates();
  // const { transcriptions } = useTranscriptions();
  // const location = useLocation();
  // 'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground'
  const [activeMenuItem, setActiveMenuItem] = useState<'Ikke Signert' | 'Signert' | 'Behandles' | 'Kø' | 'Utkast' | 'Mislyktes' | 'Maler'>('Ikke Signert');
  const [showSidebar,
    setShowSidebar] = useGlobalStore(useShallow(s => [s.showSidebar, s.setShowSidebar]));


  console.info('activeMenuItem', activeMenuItem);
  console.info("location path", location.pathname, "second-", location.pathname.split('/').pop());
  // const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] = useState(false);
  // const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);

  // const dummyMailItems: MailItem[] = [
  //   {
  //     id: "1",
  //     subject: "Team Meeting",
  //     sender: "Alice Smith",
  //     preview: "Let's discuss the project timeline...",
  //     date: "10:30 AM"
  //   },
  //   {
  //     id: "2",
  //     subject: "Quarterly Report",
  //     sender: "Bob Johnson",
  //     preview: "Attached is the Q2 financial report...",
  //     date: "Yesterday"
  //   },
  //   {
  //     id: "3",
  //     subject: "New Project Proposal",
  //     sender: "Carol Williams",
  //     preview: "I've drafted a proposal for the new client...",
  //     date: "2 days ago"
  //   },
  //   {
  //     id: "4",
  //     subject: "Holiday Party Planning",
  //     sender: "David Brown",
  //     preview: "We need volunteers for the upcoming...",
  //     date: "Last week"
  //   },
  //   {
  //     id: "5",
  //     subject: "Budget Review",
  //     sender: "Eva Green",
  //     preview: "Can we schedule a meeting to go over...",
  //     date: "2 weeks ago"
  //   },
  // ];


  // const toggleMainSidebarCollapse = () => {
  //   setIsMainSidebarCollapsed(!isMainSidebarCollapsed);
  // };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="precepto-ui-theme">
      <Toaster />
      <Meta />
      <div className="flex h-screen overflow-hidden">
        <Sheet>
          {/* Mobile Sidebar Trigger */}
          <SheetTrigger asChild>
            <button
              type="button"
              className="md:hidden text-muted-foreground hover:text-foreground absolute top-3 left-3 z-50">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>

          {/* Mobile Sidebar Content */}
          <SheetContent side="left" className="p-0 w-80">
            <AppSidebar isShowSidebar={showSidebar}
              setActiveMenuItem={setActiveMenuItem}
              activeMenuItemTitle={activeMenuItem}
            />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar isShowSidebar={showSidebar}
            setActiveMenuItem={setActiveMenuItem}
            activeMenuItemTitle={activeMenuItem}
          />
        </div>

        {/* Inbox Sidebar */}
        {showSidebar && (
          <div className="hidden md:block">
            <SidebarInner
              isVisible={true}
              activeItemTitle={activeMenuItem}
            />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <Button
              variant={"ghost"}
              onClick={() => setShowSidebar(!showSidebar)}
              className="hidden md:block text-muted-foreground hover:text-foreground"
            >
              {showSidebar ? (
                <PanelLeft className="h-6 w-6" />
              ) : (
                <PanelRight className="h-6 w-6" />
              )}
            </Button>
            <Separator orientation="vertical" className="mr-2 h-4" />
            <BreadcrumbComponent path={location.pathname} />
            {/* <BreadcrumbComponent path={convertPathIdToTitle(location.pathname, activeMenuItem, templates, transcriptions)} /> */}
            <div className="flex items-center justify-end flex-1 md:pr-8">
              {
                location.pathname === '/dashboard' ? null : (<X
                  onClick={() => router({ to: '/' })}
                  className="h-4 w-4 hover:cursor-pointer hover:scale-105"
                />)
              }
            </div>
            {/* <div className="flex items-center gap-2">
              <span className="font-semibold">Inbox</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">Primary</span>
            </div> */}
          </header>
          <div className="flex-1 overflow-auto p-4 lg:p-6">
            {/* {selectedMail ? (
                <div>
                  <h2 className="text-2xl font-bold mb-4">{selectedMail.subject}</h2>
                  <p className="text-muted-foreground mb-2">From: {selectedMail.sender}</p>
                  <p>{selectedMail.preview}</p>
                </div>
              ) : (
                <p>Select an email to view its content.</p>
              )} */}
            <Outlet />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

