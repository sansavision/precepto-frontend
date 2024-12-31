import type React from "react";
// import { useState } from "react";
// import { ArchiveX, ChevronDown, Command, File, Inbox, Search, Send, Trash2 } from 'lucide-react';
import {
    Inbox,
    Check,
    Cpu,
    ListStart,
    SquareDashedKanbanIcon,
    CircleX,
    LayoutTemplate,
    // Command,
    // Search,
    ChevronDown
} from 'lucide-react';
//  import { NavUser } from '@/components/nav-user';
import { NavUser } from "./nav-user";
import { Button } from "../ui/button";
import { cx } from "class-variance-authority";
import { useNavigate } from "@tanstack/react-router";
import { useTranscriptions } from "@/hooks/use-transcriptions";
import type { TranscriptionMeta } from "@/lib/types/transcript.types";

type ActiveItemTitle = 'Ikke Signert' | 'Signert' | 'Behandles' | 'Kø' | 'Utkast' | 'Mislyktes' | 'Maler'
interface NavItem {
    title: string;
    status?: TranscriptionMeta['status'];
    url: string;
    icon: React.ElementType;
    isActive?: boolean;
    count?: number;
}

const navItems: NavItem[] = [
    {
        title: 'Ikke Signert',
        status:"not_signed",
        url: '/dashboard',
        icon: Inbox,
        isActive: true,
        count: 12,
    },
    {
        title: 'Signert',
        status:"signed",
        url: '/dashboard',
        icon: Check,
        isActive: false,
        count: 3
    },
    {
        title: 'Behandles',
        status:"processing",
        url: '/dashboard',
        icon: Cpu,
        isActive: false,
        count: 1
    },
    {
        title: 'Kø',
        status:"queued",
        url: '/dashboard',
        icon: ListStart,
        isActive: false,
        count: 4
    },
    {
        title: 'Utkast',
        status:"draft",
        url: '/dashboard',
        icon: SquareDashedKanbanIcon,
        isActive: false,
        count: 1
    },
    {
        title: 'Mislyktes',
        status:"failed",
        url: '/dashboard',
        icon: CircleX,
        isActive: false,
        count: 1
    },
    {
        title: 'Maler',
        url: '/template',
        icon: LayoutTemplate,
        isActive: false,
        // count: 1
    },
];
// const navItems: NavItem[] = [
//   { title: "Inbox", icon: Inbox, isActive: true, count: 12 },
//   { title: "Drafts", icon: File, isActive: false, count: 3 },
//   { title: "Sent", icon: Send, isActive: false },
//   { title: "Junk", icon: ArchiveX, isActive: false, count: 8 },
//   { title: "Trash", icon: Trash2, isActive: false },
// ];

const recent_Transcription: Array<{name:string; date:string; time:string; status:TranscriptionMeta['status']}> = [
    // { name: "M.A", date: "2021-10-01", time: "10:00", status: "Ikke Signert" },
    // { name: "TA", date: "2021-10-01", time: "10:00", status: "Signert" },
    // { name: "Z.E", date: "2021-10-01", time: "10:00", status: "Behandles" },
    // { name: "FE", date: "2021-10-01", time: "10:00", status: "Kø" },
];

// const labels = [
//   { name: "Feature", color: "bg-blue-500" },
//   { name: "Bug", color: "bg-red-500" },
//   { name: "Enhancement", color: "bg-green-500" },
//   { name: "Documentation", color: "bg-yellow-500" },
// ];

interface AppSidebarProps {
    isShowSidebar: boolean;
    setActiveMenuItem: (item: ActiveItemTitle) => void;
    activeMenuItemTitle?: ActiveItemTitle;
}

const getCount = (t : TranscriptionMeta[], itemStatus?:TranscriptionMeta['status']) => {
    
    return t.filter((transcription) => transcription.status === itemStatus).length;
};
export const AppSidebar: React.FC<AppSidebarProps> = ({ isShowSidebar, setActiveMenuItem, activeMenuItemTitle }) => {
    const router = useNavigate();
    const {transcriptions} = useTranscriptions();
    //   const [_activeItem, setActiveItem] = useState(navItems[0]);

    return (
        <div className={`bg-background border-r transition-all duration-300 ease-in-out ${!isShowSidebar ? "w-20" : "w-56"} h-full flex-shrink-0`}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="border-b px-4 py-4 h-14">
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/0 text-primary-foreground">
                            {/* <Command className="h-4 w-4" /> */}
                            <img src="/assets/logo5.png" alt="Logo" width="32" height="32" className="rounded-2xl" />
                        </div>
                        {isShowSidebar && (
                            <div className="flex flex-1">
                                <span className="font-semibold text-sm">Precepto</span>
                                {/* <span className="text-xs text-muted-foreground">Team Plan</span> */}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className={cx("flex flex-col flex-1 overflow-y-auto gap-8", !isShowSidebar ? "px-1 py-1" : "px-4 py-4")}>

                    {/* Nav Items */}
                    <nav className="flex flex-col gap-4 w-full">
                        {navItems.map((item) => (
                            <Button
                                variant={"ghost"}
                                type="button"
                                key={item.title}
                                className={cx("flex flex-1 items-center w-full px-2 py-2 text-sm font-medium rounded-md",

                                    activeMenuItemTitle === item.title
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                                onClick={() => {
                                    setActiveMenuItem(item.title as ActiveItemTitle)
                                    if (item.url) {
                                      router({ to: item.url });
                                    } 
                                    // else {
                                    //   // setActiveItem(item);
                                    //   setOpen(true);
                                    // }
                                  }}
                                // onClick={() => setActiveMenuItem(item.title as ActiveItemTitle)}
                            >
                                {!isShowSidebar && (
                                    <div className="w-full flex-1 flex flex-col gap-2 items-center justify-center">
                                        <item.icon className={cx("h-4 w-4")} />
                                        <span className="text-xs">{item.title}</span>
                                    </div>
                                )}

                                {isShowSidebar && (
                                    <item.icon className={cx("h-4 w-4")} />
                                )}
                                {isShowSidebar && (
                                    <div className="flex flex-1 justify-between">
                                        <span>{item.title}</span>
                                        {item.count && (
                                            <span className="ml-auto bg-primary/50 text-white px-2 py-0.5 rounded-full text-xs">
                                                {/* {item.count} */}
                                                {getCount(transcriptions ?? [], item.status )}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Button>
                        ))}
                    </nav>

                    {/* Folders */}
                    {isShowSidebar && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Nylig</span>
                                <ChevronDown className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                {recent_Transcription.map((t) => (
                                    <Button
                                        variant="ghost"
                                        key={t.name}
                                        className="flex items-center w-full px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md"
                                    >
                                        <span>{t.name}</span>
                                        <span className="ml-auto text-xs">{t.status}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Labels */}
                    {/* {!isCollapsed && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Labels</span>
                <ChevronDown className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                {labels.map((label) => (
                  <button
                    type="button"
                    key={label.name}
                    className="flex items-center w-full px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md"
                  >
                    <div className={`h-2 w-2 rounded-full ${label.color} mr-3`} />
                    <span>{label.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )} */}
                </div>

                {/* Footer */}
                <div className={cx("border-t", isShowSidebar ? "p-4" : "p-2")}>
                    <NavUser
                        // user={{
                        //   name: "shadcn",
                        //   email: "m@example.com",
                        //   avatar: "/placeholder.svg?height=32&width=32",
                        // }}
                        isShowSidebar={isShowSidebar}
                    />
                </div>
            </div>
        </div>
    );
};

