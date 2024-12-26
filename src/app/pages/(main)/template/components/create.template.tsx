'use client';

// import { toast } from "@/components/hooks/use-toast"
import { Button } from '@/components/ui/button';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';
import { z } from 'zod';
import { useTemplates } from '@/hooks/use-templates';
import {Loader2 } from 'lucide-react'
import { useState } from 'react';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Template name must be at least 2 characters.',
  }),
  content: z.string().min(2, {
    message: 'Template content must be at least 2 characters.',
  }),
});

export function CreateTranscriptionForm() {
  const [loading, setLoading] = useState(false);
  const { createTemplate } = useTemplates();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      content: 'Replace this with your transcription template...',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    try {
      await createTemplate({ name: data.name, template: data.content, is_public: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      // toast.success('Template has been created.', {
      //   richColors: true,
      //   position: 'top-right',
      // });

    } catch (err) {
      console.error(err);
    }
    

  }

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
                Enter a name for the template.  Must be at least 2 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{loading ?<Loader2 className='h-4 w-4 animate-spin'/> : "Create"}</Button>
      </form>
    </Form>
  );
}
