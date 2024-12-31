// src/components/CreateTranscriptionForm.tsx

'use client';

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
import { useTranscriptions } from '@/hooks/use-transcriptions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2, ChevronsUpDown, Check } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
// import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"

import { useTemplates } from '@/hooks/use-templates';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  template_id: z.string().optional(),
});

export function CreateTranscriptionForm() {
  const { createTranscription } = useTranscriptions();
  const { templates, loading: templatesLoading } = useTemplates();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      template_id: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await createTranscription({
        name: data.name,
        status: 'draft',
        created_at: new Date().toISOString(),
        backend_status: 'recording_service',
        template_id: data.template_id,
      });

      toast.success('Created a transcription draft.', {
        richColors: true,
        position: 'top-right',
      });
    } catch (error) {
      toast.error('Failed to create transcription', {
        richColors: true,
        position: 'top-right',
      });
      throw error; 
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
                <Input placeholder="Enter transcription name" {...field} />
              </FormControl>
              <FormDescription>
                Enter a name for the transcription. Must be at least 2 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="template_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template</FormLabel>
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      aria-expanded={open}
                      className="w-full justify-between"
                      disabled={templatesLoading}
                    >
                      {field.value && templates && templates.length > 0
                        ? templates.find((template) => template.id === field.value)?.name
                        : templatesLoading 
                          ? "Loading templates..."
                          : "Select template..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                  <Command className="rounded-lg border shadow-md md:min-w-[450px]">
                    <CommandInput  placeholder="Search template..." className="h-9"/>
                    <CommandList>
                      <CommandEmpty> {templatesLoading ? "Loading..." : "No template found."}</CommandEmpty>
                      <CommandGroup heading="Suggestions">
                        {
                          templates?.map((template) => (
                        <CommandItem
                            key={template.id}
                            onSelect={() => {
                              form.setValue("template_id", template.id);
                              setOpen(false);
                            }}
                        >
                          <span>{template.name}</span>
                                <Check
                                className={cn(
                                   "ml-auto h-4 w-4",
                                   field.value === template.id ? "opacity-100" : "opacity-0"
                                  )}
                                  />
                          </CommandItem>
                          ))
                        }
                        </CommandGroup>
                      </CommandList>
                      </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormDescription>
                Select a template to use for this transcription (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {form.formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create"
          )}
        </Button>
      </form>
    </Form>
  );
}







// <Command>
//                       <CommandInput placeholder="Search template..." className="h-9" />
//                       <CommandEmpty>
//                         {templatesLoading ? "Loading..." : "No template found."}
//                       </CommandEmpty>
//                       <CommandGroup>
//                         {template && template?.length > 0 ? (
//                           template.map((template) => (
//                             <CommandItem
//                             key={Math.random()}
//                               key={template.id}
//                               onSelect={() => {
//                                 form.setValue("template_id", template.id);
//                                 setOpen(false);
//                               }}
//                             >
              
//                               {template.name}
//                               <Check
//                                 className={cn(
//                                   "ml-auto h-4 w-4",
//                                   field.value === template.id ? "opacity-100" : "opacity-0"
//                                 )}
//                               />
// //                             </CommandItem>
//                           ))
//                         ) : (
//                           <CommandItem disabled>
//                             {templatesLoading ? "Loading templates..." : "No templates available"}
//                           </CommandItem>
//                         )}
//                       </CommandGroup>
//                     </Command>