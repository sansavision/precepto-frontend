// src/components/CreateTranscriptionForm.tsx

'use client';

import { Button } from '@/components/ui/button';
import { headers } from 'nats.ws';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/providers/auth-provider';
import { RouteData } from '@/lib/router/routes';
import { useGlobalStore } from '@/lib/store/globalstore';
import type { TranscriptionMeta } from '@/lib/types/transcript.types';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { useNats } from '@/lib/providers/nats-provider';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});

export function CreateTranscriptionForm() {
  const router = useNavigate();
  const setTranscriptionMeta = useGlobalStore(
    (state) => state.setActiveTranscription,
  );
  const { publish } = useNats();
  const { user } = useAuth();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // Generate a unique recording ID
    const newRecordingId = uuidv4();
    const date = moment();
    // Create a new TranscriptionMeta object
    const newTranscriptionMeta: TranscriptionMeta = {
      id: newRecordingId,
      name: `${data.name} - Recording ${date.toLocaleString()}`,
      status: 'draft',
      created_at: date.toISOString(),
      created_by_id: user?.id,
      backend_status: 'recording_service',
    };
    setTranscriptionMeta(newTranscriptionMeta);
  
    // Create headers using the headers() function
    const hdrs = headers();
    hdrs.append('KV-Key', newRecordingId);
  
    // Store TranscriptionMeta in KV store via NATS
    publish('kv.transcriptions.put', JSON.stringify(newTranscriptionMeta), { headers: hdrs });
  
    toast.success('Created a transcription draft.', {
      richColors: true,
      position: 'top-right',
    });
    router({ to: `${RouteData.Record.path}/${newRecordingId}` });
  }
  // function onSubmit(data: z.infer<typeof FormSchema>) {
  //   // Generate a unique recording ID
  //   const newRecordingId = uuidv4();
  //   const date = moment();
  //   // Create a new TranscriptionMeta object
  //   const newTranscriptionMeta: TranscriptionMeta = {
  //     id: newRecordingId,
  //     name: `${data.name} - Recording ${date.toLocaleString()}`,
  //     status: 'draft',
  //     created_at: date.toISOString(),
  //     created_by_id: user?.id, // Replace with actual user ID
  //     backend_status: 'recording_service',
  //   };
  //   setTranscriptionMeta(newTranscriptionMeta);

  //   // Store TranscriptionMeta in KV store via NATS
  //   publish('kv.transcriptions.put', JSON.stringify(newTranscriptionMeta), {
  //     headers: { 'KV-Key': newRecordingId },
  //   });

  //   toast.success('Created a transcription draft.', {
  //     richColors: true,
  //     position: 'top-right',
  //   });
  //   router({ to: `${RouteData.Record.path}/${newRecordingId}` });
  // }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="JD" {...field} />
              </FormControl>
              <FormDescription>
                Enter a name for the transcription. This will make it easier to
                associate the transcription with a patient, e.g., JD for John
                Doe. Must be at least 2 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
}
