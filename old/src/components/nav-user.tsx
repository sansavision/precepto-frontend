import {
  // BadgeCheck,
  // Bell,
  // CreditCard,
  // Sparkles,
  ChevronsUpDown,
  LogOut,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/lib/providers/auth-provider';
import { useNats } from '@/lib/providers/nats-provider';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';

// {
//   user,
// }: {
//   user: {
//     name: string;
//     email: string;
//     avatar: string;
//   };
// }
export function NavUser() {
  const router = useNavigate();
  const { user, logout } = useAuth()
  const { isConnected } = useNats()
  const { isMobile } = useSidebar();
  const shortName = useMemo(() => {
    const sn = user?.user_name ? user.user_name.match(/(^\S\S?|\s\S)?/g)?.map(v => v.trim()).join("").match(/(^\S|\S$)?/g)?.join("").toLocaleUpperCase() : ""
    return sn
  }, [user?.user_name])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-12 rounded-lg">
                {/* <AvatarImage src={user.avatar} alt={user.user_name} /> */}
                <AvatarFallback className="rounded-lg">{shortName}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className={cn("truncate text-xs rounded-full w-2 h-2",
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                )}/>
              </div>
              <div className="grid md:hidden flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.user_name}</span>
                <span className={cn("truncate text-xs",
                  isConnected ? 'text-green-500' : 'text-red-500'
                )}>{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {/* <AvatarImage src={user.avatar} alt={user.user_name} /> */}
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
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
