export interface TranscriptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  shared_with: string[];
}
export interface TranscriptionMeta {
  id: string;
  name: string;
  status:
    | 'signed'
    | 'not_signed'
    | 'queued'
    | 'failed'
    | 'processing'
    | 'draft';
  backend_status?:
    | 'recording_service'
    | 'transcription_service'
    | 'summarization_service'
    | 'completed'
    | 'failed';
  template_id?: string;
  template?: TranscriptTemplate;
  audio_url?: string;
  transcript?: string;
  final_transcript?: string;
  created_at?: string;
  created_by_id?: string;
  updated_at?: string;
  backend_updated_at?: string;
  duration?: number;
  words?: number;
  speakers?: number;
  confidence?: number;
  language?: string;
  speaker_labels?: boolean;
  keywords?: string[];
  topics?: string[];
  actions?: string[];
  translations?: string[];
  summary?: string;
  notes?: string;
}

export type TranscriptionStatusType = 'signed' | 'not_signed' | 'queued' | 'failed' | 'processing' | 'draft';
export type TranscriptionBackendStatusType = 'recording_service' | 'transcription_service' | 'summarization_service' | 'completed' | 'failed';

export interface TranscriptionMetaOld {
  id: string;
  name: string;
  status: TranscriptionStatusType
  backend_status?: TranscriptionBackendStatusType;
  template_id?: string;
  audio_url?: string;
  transcript?: string;
  final_transcript?: string;
  created_at?: string;
  created_by_id?: string;
  updated_at?: string;
  backend_updated_at?: string;
  duration?: number;
  words?: number;
  speakers?: number;
  confidence?: number;
  language?: string;
  speaker_labels?: boolean;
  keywords?: string[];
  topics?: string[];
  actions?: string[];
  translations?: string[];
  summary?: string;
  notes?: string;
}
