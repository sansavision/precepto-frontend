import { Check, Command, Inbox, Cpu, SquareDashedKanbanIcon, LayoutTemplate, CircleX, ListStart } from 'lucide-react';
import * as React from 'react';

import { NavUser } from '@/components/nav-user';
import { Label } from '@/components/ui/label';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
// import type { TranscriptionMeta } from '@/lib/types/transcript.types';
import { useTranscriptions } from '@/hooks/use-transcriptions';
import { useGlobalStore } from '@/lib/store/globalstore';
import moment from 'moment';
import { useLocation, useNavigate } from '@tanstack/react-router';
// import type { TranscriptTemplate } from '@/lib/types/transcript.types';
import { useTemplates } from '@/hooks/use-templates';
import type { TranscriptionMeta, TranscriptTemplate } from '@/lib/types/transcript.types';

// This is sample data
// const user = {
//   name: 'shadcn',
//   email: 'm@example.com',
//   avatar: '/avatars/shadcn.jpg',
// };

const navMain = [
  {
    title: 'Ikke Signert',
    url: '#',
    icon: Inbox,
    isActive: true,
  },
  {
    title: 'Signert',
    url: '#',
    icon: Check,
    isActive: false,
  },
  {
    title: 'Behandles',
    url: '#',
    icon: Cpu,
    isActive: false,
  },
  {
    title: 'Kø',
    url: '#',
    icon: ListStart,
    isActive: false,
  },
  {
    title: 'Utkast',
    url: '#',
    icon: SquareDashedKanbanIcon,
    isActive: false,
  },
  {
    title: 'Mislyktes',
    url: '#',
    icon: CircleX,
    isActive: false,
  },
  {
    title: 'Maler',
    url: '#',
    icon: LayoutTemplate,
    isActive: false,
    destination: '/template',
  },
  // {
  //   title: "Junk",
  //   url: "#",
  //   icon: ArchiveX,
  //   isActive: false,
  // },
  // {
  //   title: "Trash",
  //   url: "#",
  //   icon: Trash2,
  //   isActive: false,
  // },
];
// mails: [
//   {
//     name: "William Smith",
//     email: "williamsmith@example.com",
//     subject: "Meeting Tomorrow",
//     date: "09:34 AM",
//     teaser:
//       "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
//   },
//   {
//     name: "Alice Smith",
//     email: "alicesmith@example.com",
//     subject: "Re: Project Update",
//     date: "Yesterday",
//     teaser:
//       "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
//   },
//   {
//     name: "Bob Johnson",
//     email: "bobjohnson@example.com",
//     subject: "Weekend Plans",
//     date: "2 days ago",
//     teaser:
//       "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
//   },
//   {
//     name: "Emily Davis",
//     email: "emilydavis@example.com",
//     subject: "Re: Question about Budget",
//     date: "2 days ago",
//     teaser:
//       "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
//   },
//   {
//     name: "Michael Wilson",
//     email: "michaelwilson@example.com",
//     subject: "Important Announcement",
//     date: "1 week ago",
//     teaser:
//       "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
//   },
//   {
//     name: "Sarah Brown",
//     email: "sarahbrown@example.com",
//     subject: "Re: Feedback on Proposal",
//     date: "1 week ago",
//     teaser:
//       "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
//   },
//   {
//     name: "David Lee",
//     email: "davidlee@example.com",
//     subject: "New Project Idea",
//     date: "1 week ago",
//     teaser:
//       "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
//   },
//   {
//     name: "Olivia Wilson",
//     email: "oliviawilson@example.com",
//     subject: "Vacation Plans",
//     date: "1 week ago",
//     teaser:
//       "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
//   },
//   {
//     name: "James Martin",
//     email: "jamesmartin@example.com",
//     subject: "Re: Conference Registration",
//     date: "1 week ago",
//     teaser:
//       "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
//   },
//   {
//     name: "Sophia White",
//     email: "sophiawhite@example.com",
//     subject: "Team Dinner",
//     date: "1 week ago",
//     teaser:
//       "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
//   },
// ],

// const transcriptions: TranscriptionMeta[] = [
//   {
//     id: '1',
//     name: 'BT',
//     created_at: new Date('2022-01-01T10:00:00Z').toISOString(),
//     status: 'complete',
//   },
//   {
//     id: '2',
//     name: 'KL',
//     created_at: new Date('2022-01-02T11:00:00Z').toISOString(),
//     status: 'incomplete',
//   },
//   {
//     id: '3',
//     name: 'SA',
//     created_at: new Date('2022-01-03T12:00:00Z').toISOString(),
//     status: 'queued',
//   },
//   {
//     id: '4',
//     name: 'JD',
//     created_at: new Date('2022-01-04T13:00:00Z').toISOString(),
//     status: 'complete',
//   },
//   {
//     id: '5',
//     name: 'MS',
//     created_at: new Date('2022-01-05T14:00:00Z').toISOString(),
//     status: 'incomplete',
//   },
//   {
//     id: '6',
//     name: 'RP',
//     created_at: new Date('2022-01-06T15:00:00Z').toISOString(),
//     status: 'queued',
//   },
//   {
//     id: '7',
//     name: 'AL',
//     created_at: new Date('2022-01-07T16:00:00Z').toISOString(),
//     status: 'complete',
//   },
//   {
//     id: '8',
//     name: 'BC',
//     created_at: new Date('2022-01-08T17:00:00Z').toISOString(),
//     status: 'incomplete',
//   },
//   {
//     id: '9',
//     name: 'DE',
//     created_at: new Date('2022-01-09T18:00:00Z').toISOString(),
//     status: 'queued',
//   },
//   {
//     id: '10',
//     name: 'FG',
//     created_at: new Date('2022-01-10T19:00:00Z').toISOString(),
//     status: 'complete',
//   },
//   {
//     id: '11',
//     name: 'HI',
//     created_at: new Date('2022-01-11T20:00:00Z').toISOString(),
//     status: 'incomplete',
//   },
//   {
//     id: '12',
//     name: 'JK',
//     created_at: new Date('2022-01-12T21:00:00Z').toISOString(),
//     status: 'queued',
//   },
//   {
//     id: '13',
//     name: 'LM',
//     created_at: new Date('2022-01-13T22:00:00Z').toISOString(),
//     status: 'complete',
//   },
//   {
//     id: '14',
//     name: 'NO',
//     created_at: new Date('2022-01-14T23:00:00Z').toISOString(),
//     status: 'incomplete',
//   },
//   {
//     id: '15',
//     name: 'PQ',
//     created_at: new Date('2022-01-15T00:00:00Z').toISOString(),
//     status: 'queued',
//   },
//   {
//     id: '16',
//     name: 'RS',
//     created_at: new Date('2022-01-16T01:00:00Z').toISOString(),
//     status: 'complete',
//   },
//   {
//     id: '17',
//     name: 'TU',
//     created_at: new Date('2022-01-17T02:00:00Z').toISOString(),
//     status: 'incomplete',
//   },
//   {
//     id: '18',
//     name: 'VW',
//     created_at: new Date('2022-01-18T03:00:00Z').toISOString(),
//     status: 'queued',
//   },
//   {
//     id: '19',
//     name: 'XY',
//     created_at: new Date('2022-01-19T04:00:00Z').toISOString(),
//     status: 'complete',
//   },
//   {
//     id: '20',
//     name: 'ZA',
//     created_at: new Date('2022-01-20T05:00:00Z').toISOString(),
//     status: 'incomplete',
//   },
//   {
//     id: '21',
//     name: 'AB',
//     created_at: new Date('2022-01-21T06:00:00Z').toISOString(),
//     status: 'queued',
//   },
//   {
//     id: '22',
//     name: 'CD',
//     created_at: new Date('2022-01-22T07:00:00Z').toISOString(),
//     status: 'complete',
//   },
//   {
//     id: '23',
//     name: 'EF',
//     created_at: new Date('2022-01-23T08:00:00Z').toISOString(),
//     status: 'incomplete',
//   },
// ];

// Function to sort data by created_at
// const sortDataByDate = (data) => {
//   return data.sort((a, b) => a.created_at - b.created_at);
// };

// // Function to filter data by status
// const filterDataByStatus = (data, status) => {
//   return data.filter(item => item.status === status);
// };

// // Function to display date and time
// const displayDateTime = (timestamp) => {
//   const date = new Date(timestamp);
//   return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
// };




// const templates: TranscriptTemplate[] = [
//   {
//     id: '1',
//     name: 'BT',
//     created_by_id: '1',
//     is_public: true,
//     shared_with: [],
//     created_at: new Date('2022-01-01T10:00:00Z').toISOString(),
//     updated_at: new Date('2022-01-01T10:00:00Z').toISOString(),
//     template: 'BT template',
//   }
// ]
const statusMap: { [key: string]: string } = {
  'Ikke Signert': 'not_signed',
  'Signert': 'signed',
  'Kø': 'queued',
  'Behandles': 'processing',
  'Utkast': 'draft',
  'Mislyktes': 'failed',
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useNavigate();
  const location = useLocation();
  const setActiveTranscription = useGlobalStore(
    (state) => state.setActiveTranscription,
  );
  const setActiveTemplate = useGlobalStore(
    (state) => state.setActiveTemplate,
  );

  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [sortMode, setSortMode] = React.useState<'date' | 'name'>('date');
  const [activeItem, setActiveItem] = React.useState(navMain[0]);
  const [search, setSearch] = React.useState('');
  const { templates, loading: loadingTemplate, error: errorTemplate } = useTemplates();
  console.info("templates xxx", templates)
  const { transcriptions, loading, error } = useTranscriptions();

  const filtred_transcriptions = React.useMemo(() => {
    if (!transcriptions) { return []; }

    const term = search.toLowerCase();
    const activeStatus = statusMap[activeItem.title] || 'queued';

    return transcriptions
      .filter(t => t.status === activeStatus)
      .filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.created_at?.toLowerCase().includes(term) ||
        t.status.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        if (sortMode === 'date') {
          return a.created_at?.localeCompare(b.created_at ?? '') ?? 0;
        }
        return a.name.localeCompare(b.name);
      });
  }, [search, sortMode, transcriptions, activeItem]);
  const filtred_templates = React.useMemo(() => {
    if (!templates) { return []; }

    const term = search.toLowerCase();

    return templates
      .filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.created_at?.toLowerCase().includes(term) ||
        t.template.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        if (sortMode === 'date') {
          return a.created_at?.localeCompare(b.created_at ?? '') ?? 0;
        }
        return a.name.localeCompare(b.name);
      });
  }, [search, sortMode, templates]);

  const { setOpen } = useSidebar();

  type RenderContentProps = { filtred_transcriptions: TranscriptionMeta[]; templates: TranscriptTemplate[] | null }
  const RenderInfo = ({ filtred_transcriptions, templates }: RenderContentProps) => {
    const transcription_info = (
      <>
        {loading && <div>Laster...</div>}
        {error && <div>Feil: {error}</div>}
        {!loading && !error && filtred_transcriptions.length === 0 && (
          <div className="p-4 text-sm">Ingen transkripsjoner funnet.</div>
        )}
      </>
    )
    const template_info = (
      <>
        {loadingTemplate && <div>Laster...</div>}
        {errorTemplate && <div>Feil: {errorTemplate}</div>}
        {!loadingTemplate && !errorTemplate && templates?.length === 0 && (
          <div className="p-4 text-sm">Ingen mal funnet.</div>
        )}
      </>
    )
    if (activeItem.title === 'Maler') {
      return template_info
    }
    return transcription_info
  }

  const RenderContent = ({ filtred_transcriptions, templates }: RenderContentProps) => {
    const transcriptions_render = (
      filtred_transcriptions.map((t) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          // href="#"
          onClick={() => {
            setActiveTranscription(t);
            if (t.status === 'draft') {
              router({ to: `/draft/${t.id}` });
            } else {
              router({ to: `/transcription/${t.id}` });
            }
          }}
          key={t.id}
          className="hover:cursor-pointer flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="flex w-full items-center gap-2">
            {/* <span className='truncate max-w-40 capitalize'>{t.status === "draft" ? t.name.split("-")[0]: t.name}</span>{' '} */}
            <span className='truncate max-w-40 capitalize'>{ t.name.split("-")[0]}</span>{' '}
            <span className="ml-auto text-xs flex gap-x-4">
              <span>
                {t.created_at &&
                new Date(t.created_at).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'long',
                })}
                </span>
                <span>
                {t.created_at && moment(t.created_at).format('HH:mm')}
                </span>
            </span>
          </div>

          {/* <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
            {t.created_at && moment(t.created_at).format('HH:mm')}
          </span> */}
        </div>
      ))
    )
    const templates_render = (
      templates?.map((t) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          // href="#"
          onClick={() => {
            setActiveTemplate(t);
            router({ to: `/template/${t.id}` });
          }}
          key={t.id}
          className="hover:cursor-pointer flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="flex w-full items-center gap-2">
            <span>{t.name}</span>{' '}
            <span className="ml-auto text-xs">
              {t.created_at &&
                new Date(t.created_at).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'long',
                })}
            </span>
          </div>

          <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
            {t.created_at && moment(t.created_at).format('HH:mm')}
          </span>
        </div>
      ))
    )
    if (activeItem.title === 'Maler') {
      return templates_render
    }
    return transcriptions_render
  };


  React.useEffect(() => {
    if (location.pathname === '/template') {
      setActiveItem(navMain[6])
    } else if (location.pathname.includes('/draft')) {
      setActiveItem(navMain[4])
    }
    else {
      setActiveItem(navMain[0])
    }
  }, [location.pathname])

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg  bg-[#a944bb] text-sidebar-primary-foreground">
                    <Command className="size-4 " />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Precepto Inc</span>
                    <span className="truncate text-xs">Precepto</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item);
                        if (item.destination) {
                          router({ to: item.destination });
                        } else {
                          // setActiveItem(item);
                          setOpen(true);
                        }
                      }}
                      isActive={activeItem.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              {activeItem.title}
            </div>
            <Label className="flex items-center gap-2 text-sm">
              <span>Sorter etter dato</span>
              <Switch
                className="shadow-none"
                checked={sortMode === 'date'}
                onCheckedChange={(v) => setSortMode(v ? 'date' : 'name')}
              />
            </Label>
          </div>
          <SidebarInput
            placeholder="Type to search..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>

              <RenderInfo
                filtred_transcriptions={filtred_transcriptions}
                templates={filtred_templates}
              />
              <RenderContent
                filtred_transcriptions={filtred_transcriptions}
                templates={filtred_templates}
              />

            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
