// src/components/TemplateManager.tsx
import type React from 'react';
import { useEffect, useState } from 'react';
import { useTemplates } from '@/hooks/use-templates';
import type { TranscriptTemplate } from '@/lib/types/transcript.types';
import TemplateBuilder from '@/components/Editor/TemplateBuilder';
import { toast } from 'sonner'

const TemplateManager: React.FC<{ template_id: string }> = ({ template_id }) => {

  const { templates, updateTemplate, deleteTemplate } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<TranscriptTemplate | null>(null);

  useEffect(() => {

    const loadedTemplate = templates?.find((t) => t.id === template_id)
    if (loadedTemplate) {
      setSelectedTemplate(loadedTemplate)
    }
  }, [templates, template_id]);

  const handleUpdate = async (content: string) => {
    if (selectedTemplate) {
      try {
        await updateTemplate({ ...selectedTemplate, name: selectedTemplate.name, template: content });
        toast.success('Malen ble oppdatert')
      }
      catch (error) {
        toast.error('Kunne ikke oppdatere malen')
        console.error(error)  
      }
    }
  };

  const handleDelete = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(templateId);
        toast.success('Malen ble slettet')
      }
      catch (error) {
        toast.error('Kunne ikke slette malen')
        throw error
      }
    }
  };


  return <div className='w-full h-full'>


    <TemplateBuilder
      content={selectedTemplate?.template || ''}
      onDelete={() => handleDelete(template_id)}
      name={selectedTemplate?.name || ''}
      description={selectedTemplate?.description || ''}
      template_id={selectedTemplate?.id || ''}
      onUpdate={(content) => handleUpdate(content)}
    />
  </div>
}

export default TemplateManager;