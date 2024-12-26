import type { TranscriptionMeta, TranscriptTemplate } from '@/lib/types/transcript.types';
import { create } from 'zustand';

export type State = {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;

  rightPaneContent: React.ReactNode;
  setRightPaneContent: (content: React.ReactNode) => void;

  showRightPane: boolean;
  setShowRightPane: (show: boolean) => void;

  showCreateTranscriptionModal: boolean;
  setShowCreateTranscriptionModal: (show: boolean) => void;

  showCreateTemplateModal: boolean;
  setShowCreateTemplateModal: (show: boolean) => void;

  showDeleteTranscriptionModal: boolean;
  setShowDeleteTranscriptionModal: (show: boolean) => void;

  showDeleteAccountModal: boolean;
  setShowDeleteAccountModal: (show: boolean) => void;

  activeTranscription: TranscriptionMeta | null;
  setActiveTranscription: (transcription: TranscriptionMeta) => void;
  activeTemplate: TranscriptTemplate | null;
  setActiveTemplate: (transcription: TranscriptTemplate) => void;
  //   activeTranscription: { name: string; id: string, description: string } | null;
  //   setActiveTranscription: (workspace: { name: string; id: string, description: string }) => void;

  pageTitle: { title: string; description: string; link: string } | null;
  breadcrumbItems: { title: string; link: string }[] | null;

  setPagetitle: (title: string, description: string, link: string) => void;
  setBreadcrumbItems: (items: { title: string; link: string }[]) => void;
};

export const useGlobalStore = create<State>()((set) => ({
  showSidebar: true,
  setShowSidebar: (show) => set({ showSidebar: show }),

  showRightPane: true,
  setShowRightPane: (show) => set({ showRightPane: show }),
  rightPaneContent: null,
  setRightPaneContent: (content) => set({ rightPaneContent: content }),

  showCreateTranscriptionModal: false,
  setShowCreateTranscriptionModal: (show) =>
    set({ showCreateTranscriptionModal: show }),

  showCreateTemplateModal: false,
  setShowCreateTemplateModal: (show) => set({ showCreateTemplateModal: show }),

  showDeleteTranscriptionModal: false,
  setShowDeleteTranscriptionModal: (show) =>
    set({ showDeleteTranscriptionModal: show }),

  showDeleteAccountModal: false,
  setShowDeleteAccountModal: (show) => set({ showDeleteAccountModal: show }),

  activeTranscription: null,
  setActiveTranscription: (transcription) =>
    set({ activeTranscription: transcription }),

  activeTemplate: null,
  setActiveTemplate: (transcription) => set({ activeTemplate: transcription }),

  pageTitle: null,
  breadcrumbItems: null,

  setPagetitle: (title, description, link) =>
    set({ pageTitle: { title, description, link } }),
  setBreadcrumbItems: (items) => set({ breadcrumbItems: items }),
}));
