// src/components/draft.tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { headers } from 'nats.ws';
import { Button } from '@/components/ui/button';
import { useTranscriptions } from '@/hooks/use-transcriptions';
import { useNats } from '@/lib/providers/nats-provider';
import type { TranscriptionMeta } from '@/lib/types/transcript.types';
import { useEffect, useRef, useState } from 'react';
// import { WaveformAnimation } from './components/waves';
import { useNavigate } from '@tanstack/react-router';
import { RouteData } from '@/lib/router/routes';
import { useTemplates } from '@/hooks/use-templates';
import { cn } from "@/lib/utils";

interface DraftProps {
  draft_id: string;
}
const Draft = ({ draft_id }: DraftProps) => {
  // const [templates, setTemplates] = useState<TranscriptTemplate[]>([]);
  const audio_combined_Url = `http://localhost:5000/audio/${draft_id}`;
  console.info("audio_combined_Url", audio_combined_Url)
  const { templates } = useTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const { transcriptions, fetchTranscriptions } = useTranscriptions();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcriptionMeta, setTranscriptionMeta] =
    useState<TranscriptionMeta | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const playbackChunksRef = useRef<Blob[]>([]); // New reference for playback
  const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { natsConnection, isConnected, publish } = useNats();
  const router = useNavigate();

  useEffect(() => {
    const t = transcriptions?.find((t) => t.id === draft_id);
    if (t) {
      setTranscriptionMeta(t);
    }
  }, [transcriptions, draft_id]);

  useEffect(() => {
    if (!isConnected) {
      console.warn('NATS is not connected.');
    }
  }, [isConnected]);

  const startRecording = async () => {
    if (!(isConnected || natsConnection)) {
      setError(
        'Unable to start recording: NATS connection is not established.',
      );
      return;
    }

    try {
      setError(null);
      if (!transcriptionMeta) {
        throw new Error('No active transcription');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.onstop = handleStop;

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setIsCompleted(false);

      // Create headers
      const hdrs = headers();
      hdrs.append('KV-Key', transcriptionMeta.id);

      // Store TranscriptionMeta in KV store via NATS
      publish('kv.transcriptions.put', JSON.stringify(transcriptionMeta), {
        headers: hdrs,
      });

      // Start uploading chunks every 5 seconds
      uploadIntervalRef.current = setInterval(uploadChunks, 5000);
    } catch (err) {
      console.error('Error accessing microphone', err);
      setError('Microphone access denied or unavailable.');
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      audioChunksRef.current.push(event.data); // For uploading
      playbackChunksRef.current.push(event.data); // For playback
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
        uploadIntervalRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      uploadIntervalRef.current = setInterval(uploadChunks, 5000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
        uploadIntervalRef.current = null;
      }
    }
  };

  const handleStop = () => {
    uploadChunks(); // Upload any remaining chunks
    const audioBlob = new Blob(playbackChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
  };

  const uploadChunks = async () => {
    if (!natsConnection || !transcriptionMeta?.id) {
      return;
    }
    if (audioChunksRef.current.length === 0) {
      return;
    }

    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const arrayBuffer = await blob.arrayBuffer();

    try {
      // Create headers
      const hdrs = headers();
      hdrs.append('Recording-ID', transcriptionMeta.id);

      publish('audio.chunks', new Uint8Array(arrayBuffer), {
        headers: hdrs,
      });
      // Clear chunks after successful upload
      audioChunksRef.current = [];
    } catch (err) {
      console.error('Upload failed', err);
      setError('Failed to upload audio. Please check your network connection.');
    }
  };

  const markAsComplete = () => {
    setIsCompleted(true);
    stopRecording();
    if (!selectedTemplateId) {
      setError('Please select a template to complete the recording.')
      return;
    }
    if (transcriptionMeta?.id) {
      const updatedMeta: TranscriptionMeta = {
        ...transcriptionMeta,
        status: 'queued',
        updated_at: new Date().toISOString(),
        backend_status: 'recording_service',
        template_id: selectedTemplateId,
      };
      setTranscriptionMeta(updatedMeta);

      // Create headers
      const hdrs = headers();
      hdrs.append('KV-Key', transcriptionMeta.id);

      // Update TranscriptionMeta in KV store
      publish('kv.transcriptions.put', JSON.stringify(updatedMeta), {
        headers: hdrs,
      });

      // Notify backend that recording is complete
      publish('recording.completed', JSON.stringify(updatedMeta));
    }
  };

  const markAsIncomplete = () => {
    setIsCompleted(false);
    startRecording();
  };

  // Delete Transcription Draft
  const deleteTranscription = () => {
    if (!transcriptionMeta?.id) {
      setError('No active transcription to delete.');
      return;
    }

    // Confirm deletion
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this transcription draft? This action cannot be undone.',
    );

    if (!confirmDelete) {
      return;
    }

    // Create headers
    const hdrs = headers();
    hdrs.append('KV-Key', transcriptionMeta.id);

    // Publish delete request
    publish('transcription.delete', '', {
      headers: hdrs,
    });

    // Remove transcription from local state
    setTranscriptionMeta(null);

    // Fetch updated transcriptions
    fetchTranscriptions();

    // Navigate back to dashboard or another appropriate page
    router({ to: RouteData.Dashboard.path });
  };

  return (
    // <div className="flex flex-col items-center justify-center min-h-screen w-full p-4">
    <div className={cn("flex flex-col items-center justify-center h-full w-full p-4",

      isRecording && !isPaused && "animate-pulsate",
    )}>
      <div className="flex-1" />
      <div className="w-full max-w-md rounded-lg shadow-md p-6">
        {!isConnected && (
          <p className="text-red-500 text-center mb-4">
            Disconnected from server.
          </p>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}


        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {!isRecording && !isCompleted && (
            <Button 
            variant={"link"}
            className="h-fit"
            onClick={startRecording}>

              <img
                width={96}
                className="hover:scale-105"
                src="/assets/voice_record.png"
                alt="select transcription"
              />
            </Button>
          )}
          {isRecording && !isPaused && (
            <Button
              onClick={pauseRecording}
              variant={"link"}
              className="h-fit"
              // className="bg-yellow-500 hover:bg-yellow-600"
            >
                           <img
                width={96}
                className="hover:scale-105"
                src="/assets/voice_pause.png"
                alt="select transcription"
              />
            </Button>
          )}
          {isPaused && (
            <Button
              onClick={resumeRecording}
              variant={"link"}
              className="h-fit"
              // className="bg-blue-500 hover:bg-blue-600"
            >
               <img
                width={96}
                className="hover:scale-105"
                src="/assets/voice_record.png"
                alt="select transcription"
              />

            </Button>
          )}
          {isRecording && (
            <Button
              onClick={stopRecording}
              variant={"link"}
              className="h-fit"
              // className="bg-red-500 hover:bg-red-600"
              >
          <img
                width={124}
                className="hover:scale-105"
                src="/assets/voice_stop.png"
                alt="select transcription"
              />
            </Button>
          )}

          {isCompleted && (
            <Button
              onClick={markAsIncomplete}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Mark as Incomplete
            </Button>
          )}




        </div>


        {audioUrl && (
          <div className="mt-4">
            {/* <h3 className="text-lg font-semibold mb-2">Playback</h3> */}
            {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}

        {transcriptionMeta && (
          <div className="mt-4 text-sm text-gray-600">
            <h3 className="text-lg font-semibold mb-2">Recording Info</h3>
            <p>ID: {transcriptionMeta.id}</p>
            <p>Status: {transcriptionMeta.status}</p>
            <p>
              Created:{' '}
              {new Date(transcriptionMeta.created_at ?? '').toLocaleString()}
            </p>
            <p>
              Updated:{' '}
              {new Date(transcriptionMeta.updated_at ?? transcriptionMeta.created_at ?? '').toLocaleString()}
            </p>
          </div>
        )}
      </div>
      <div className="flex-1" />
      <div className="self-start w-full flex justify-between">
        {!isRecording && !isCompleted && (
          <Button
            onClick={deleteTranscription}
            className="bg-red-500 hover:bg-red-600"
          >
         Slett utkast
          </Button>
        )}
        {!isRecording && !isCompleted && templates?.length && (
          <div className="mb-4">
            <Select

              // id="template-select"
              value={selectedTemplateId || ''}
              onValueChange={(value) => setSelectedTemplateId(value)}
            >
              <SelectTrigger
                className="mt-1 block w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">Select a template</SelectItem> */}
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {!isRecording && !isCompleted && playbackChunksRef.current.length > 0 && (
          <Button
            onClick={markAsComplete}
            className="bg-purple-500 hover:bg-purple-600"
            disabled={!selectedTemplateId}
          >
         Innspillingen er fullført
          </Button>
        )}
      </div>
      <div className="h-20" />
    </div>
  );
};

export default Draft;



// <div className="flex justify-center mb-4">
// {isRecording && !isPaused && <WaveformAnimation />}
// </div>