import { useTemplates } from '@/hooks/use-templates';
import { useTranscriptions } from '@/hooks/use-transcriptions';
import { useGlobalStore } from '@/lib/store/globalstore';
import type { TranscriptionMeta, TranscriptTemplate } from '@/lib/types/transcript.types';
import { useNavigate } from '@tanstack/react-router';
// import { Mail } from 'lucide-react';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

// interface MailItem {
//     id: string;
//     subject: string;
//     sender: string;
//     preview: string;
//     date: string;
// }

const statusMap: { [key: string]: string } = {
    'Ikke Signert': 'not_signed',
    'Signert': 'signed',
    'Kø': 'queued',
    'Behandles': 'processing',
    'Utkast': 'draft',
    'Mislyktes': 'failed',
};

interface InboxSidebarProps {
    isVisible: boolean;
    activeItemTitle: string;
}

export const SidebarInner: React.FC<InboxSidebarProps> = ({ isVisible, activeItemTitle }) => {
    const router = useNavigate();
    // const location = useLocation();
    const setShowSidebar = useGlobalStore(
        (state) => state.setShowSidebar,
    );
    const setActiveTranscription = useGlobalStore(
        (state) => state.setActiveTranscription,
    );
    const setActiveTemplate = useGlobalStore(
        (state) => state.setActiveTemplate,
    );

    const [sortMode, setSortMode] = useState<'date' | 'name'>('date');
    const [search, setSearch] = useState('');
    const { templates, loading: loadingTemplate, error: errorTemplate } = useTemplates();
    console.info("templates xxx", templates)
    const { transcriptions, loading, error } = useTranscriptions();
    console.info("transcriptions yyy", transcriptions)

    const filtred_transcriptions = useMemo(() => {
        if (!transcriptions) { return []; }

        const term = search.toLowerCase();
        const activeStatus = statusMap[activeItemTitle] || 'queued';

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
    }, [search, sortMode, transcriptions, activeItemTitle]);
    const filtred_templates = useMemo(() => {
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
        if (activeItemTitle === 'Maler') {
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
                        setShowSidebar(false);
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
                        <span className='truncate max-w-40 capitalize'>{t.name.split("-")[0]}</span>{' '}
                        <span className="ml-auto text-xs flex gap-x-4 text-white/70">
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
                        setShowSidebar(false);
                        setActiveTemplate(t);
                        router({ to: `/template/${t.id}` });
                    }}
                    key={t.id}
                    className="hover:cursor-pointer flex flex-col items-start gap-4 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                    <div className="flex w-full items-center gap-2">
                        <span>{t.name}</span>
                    </div>

                    <div className="flex w-full items-center justify-between text-white/70">
                        <span className="text-xs">
                            {t.created_at && moment(t.created_at).format('HH:mm')}
                        </span>
                        <span className="text-xs">
                            {t.created_at &&
                                new Date(t.created_at).toLocaleDateString(undefined, {
                                    day: 'numeric',
                                    month: 'long',
                                })}
                        </span>
                    </div>
                </div>
            ))
        )
        if (activeItemTitle === 'Maler') {
            return templates_render
        }
        return transcriptions_render
    };


    if (!isVisible) { return null; }

    return (
        <div className="w-72 border-r bg-background h-full">
            <div className="flex flex-col  gap-4 p-4 font-semibold">
                <div className="flex w-full items-center justify-between">
                    <div className="text-base font-medium text-foreground text-[100%]">
                        {activeItemTitle}
                    </div>
                    <Label className="flex items-center gap-2 ">
                        <span className='text-[80%]'>Sorter (dato)</span>
                        <Switch
                            className="shadow-none"
                            checked={sortMode === 'date'}
                            onCheckedChange={(v) => setSortMode(v ? 'date' : 'name')}
                        />
                    </Label>
                </div>
                <div className="relative mb-4">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                        onChange={(e) => setSearch(e.target.value)}
                        type="text"
                        placeholder="Search..."
                        className="w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
            </div>
            <div className="divide-y ">

                <RenderInfo
                    filtred_transcriptions={filtred_transcriptions}
                    templates={filtred_templates}
                />
                <RenderContent
                    filtred_transcriptions={filtred_transcriptions}
                    templates={filtred_templates}
                />
                {/* {mailItems.map((mail) => (
                    <button
                        type='button'
                        key={mail.id}
                        className="w-full text-left p-4 hover:bg-muted transition-colors"
                        onClick={() => onSelectMail(mail)}
                    >
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1 overflow-hidden">
                                <div className="font-medium truncate">{mail.subject}</div>
                                <div className="text-sm text-muted-foreground truncate">{mail.sender}</div>
                                <div className="text-sm text-muted-foreground truncate">{mail.preview}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">{mail.date}</div>
                        </div>
                    </button>
                ))} */}
            </div>
        </div>
    );
};

