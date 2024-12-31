export interface SocketMessage {
  id: string;
  resource_type: 'transcription';
  resource_id: string;
  message?: string;
  status: 'success' | 'error';
}
