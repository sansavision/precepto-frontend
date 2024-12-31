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
import { Loader2 } from 'lucide-react'
import { useState } from 'react';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Template name must be at least 2 characters.',
  }),
  description: z.string(),
  content: z.string().min(2, {
    message: 'Template content must be at least 2 characters.',
  }),
});

interface CreateTemplateFormProps {
  content?: string;
  name?: string;
  description?: string;
  isUpdate?: boolean;
  template_id?: string;
  cb?: () => void;
}
export function CreateTemplateForm({ content, name, description, isUpdate, template_id, cb }: CreateTemplateFormProps) {
  const [loading, setLoading] = useState(false);
  const { createTemplate, updateTemplate, templates } = useTemplates();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: name ?? '',
      description: description ?? '',
      content: content ?? '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    try {
      if (isUpdate) {
        const oldTemplate = templates?.find((t) => t.id === template_id);
        if (!oldTemplate) {
          throw new Error('Template not found');
        }
        await updateTemplate({ ...oldTemplate, name: data.name, template: data.content, description: data.description });
        // toast.success('Template has been updated.', {
        //   richColors: true,
        //   position: 'top-right',
        // });
      } else {
        await createTemplate({ name: data.name, description:data.description, template: data.content, is_public: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      }
      // await createTemplate({  name: data.name, template: data.content, is_public: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      // toast.success('Template has been created.', {
      //   richColors: true,
      //   position: 'top-right',
      // });
      if(cb) {
        cb();
      }

    } catch (err) {
      console.error(err);
    }
finally {
      setLoading(false);
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
              <FormLabel>Navn</FormLabel>
              <FormControl>
                <Input placeholder="JD" {...field} />
              </FormControl>
              <FormDescription>
                Skriv inn et navn for malen. Må bestå av minst 2 tegn.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivelse</FormLabel>
              <FormControl>
                <Input placeholder="JD" {...field} />
              </FormControl>
              <FormDescription>
                Skriv inn et beskrivelse for malen.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{loading ? <Loader2 className='h-4 w-4 animate-spin' /> : isUpdate? "Oppdater": "Skape"}</Button>
      </form>
    </Form>
  );
}
