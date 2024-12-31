'use client'
import { cn } from '@/lib/utils';

import { ChevronsUpDown, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/lib/providers/auth-provider';
import { useNats } from '@/lib/providers/nats-provider';
import { useMemo } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '../ui/button';
import { cx } from 'class-variance-authority';

// interface User {
//   name: string;
//   email: string;
//   avatar: string;
// }

interface NavUserProps {
  isShowSidebar: boolean;
}

export const NavUser: React.FC<NavUserProps> = ({ isShowSidebar }) => {
  const router = useNavigate();
  const { user, logout } = useAuth()
  console.info({
    isShowSidebar,
    router,
    logout
  })
  const { isConnected } = useNats()
  const shortName = useMemo(() => {
    const sn = user?.user_name ? user.user_name.match(/(^\S\S?|\s\S)?/g)?.map(v => v.trim()).join("").match(/(^\S|\S$)?/g)?.join("").toLocaleUpperCase() : ""
    return sn
  }, [user?.user_name])
  return (
    <div className="flex w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            size="lg"
            className={cx('flex gap-4 items-center px-1', !isShowSidebar && "px-1 gap-2")}
          // className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
          >
            <Avatar className={cx( isShowSidebar ? "w-14 h-8 rounded-lg" : "w-4 h-6 rounded-sm ")}>
              {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
              <AvatarFallback className={cx("rounded-lg", "text-xs")}>{shortName}</AvatarFallback>
            </Avatar>
            {
              !isShowSidebar &&
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className={cn("truncate text-xs rounded-full w-2 h-2",
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                )} />
              </div>
            }
            {
              isShowSidebar &&
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold capitalize">{user?.user_name}</span>
                <span className={cn("truncate text-xs",
                  isConnected ? 'text-green-500' : 'text-red-500'
                )}>{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            }
            <ChevronsUpDown className="ml-auto size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          side={!isShowSidebar ? 'bottom' : 'right'}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
                <AvatarFallback className="rounded-lg">{shortName}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.user_name}</span>
                <span className={cn("truncate text-xs",
                  isConnected ? 'text-green-500' : 'text-red-500'
                )}>{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              logout()
              router({ to: '/auth' })
            }}
          >
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

