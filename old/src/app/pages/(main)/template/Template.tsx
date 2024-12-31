// src/components/TemplateManager.tsx
import type React from 'react';
import { useEffect, useState } from 'react';
// import { useTemplates } from '../hooks/useTemplates';
// import { TranscriptTemplate } from '../types';
// import Editor from '../../../../components/Editor/Editor'; // TipTap-based Editor component
// import { v4 as uuidv4 } from 'uuid';
import { useTemplates } from '@/hooks/use-templates';
import type { TranscriptTemplate } from '@/lib/types/transcript.types';
import TemplateBuilder from '@/components/Editor/TemplateBuilder';
import { toast } from 'sonner'

const TemplateManager: React.FC<{ template_id: string }> = ({ template_id }) => {

  const { templates, updateTemplate, deleteTemplate } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<TranscriptTemplate | null>(null);
  // const [isEditing, setIsEditing] = useState<boolean>(false);
  // const [isCreating, setIsCreating] = useState<boolean>(false);
  // const [newTemplateName, setNewTemplateName] = useState<string>('');
  // const [newTemplateContent, setNewTemplateContent] = useState<string>('');
  // const [shareUserId, setShareUserId] = useState<string>('');
  // const [showShareModal, setShowShareModal] = useState<boolean>(false);
  // const [shareTemplateId, setShareTemplateId] = useState<string>('');


  useEffect(() => {

    const loadedTemplate = templates?.find((t) => t.id === template_id)
    if (loadedTemplate) {
      setSelectedTemplate(loadedTemplate)
    }
  }, [templates, template_id]);

  // const handleCreate = async () => {
  //   if (!newTemplateName.trim()) {
  //     alert('Template name cannot be empty.');
  //     return;
  //   }
  //   await createTemplate({ name: newTemplateName, template: newTemplateContent, is_public: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  //   setNewTemplateName('');
  //   setNewTemplateContent('');
  //   setIsCreating(false);
  // };

  const handleUpdate = async (content: string) => {
    console.log('selectedTemplate', selectedTemplate)
    console.log('content', content)
    if (selectedTemplate) {
      try {
        await updateTemplate({ ...selectedTemplate, name: selectedTemplate.name, template: content });
        toast.success('Malen ble oppdatert')
      }
      catch (error) {
        toast.error('Kunne ikke oppdatere malen')
      }

      // setSelectedTemplate(null);
      // setIsEditing(false);
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

  // const handleShare = async () => {
  //   if (shareTemplateId && shareUserId) {
  //     await shareTemplate(shareTemplateId, shareUserId);
  //     setShareUserId('');
  //     setShareTemplateId('');
  //     setShowShareModal(false);
  //   }
  // };


  return <div className='w-full h-full'>


    <TemplateBuilder
      content={selectedTemplate?.template || ''}
      onDelete={() => handleDelete(template_id)}
      name={selectedTemplate?.name || ''}
      description={selectedTemplate?.description || ''}
      template_id={selectedTemplate?.id || ''}
      // onUpdate={(content) => setNewTemplateContent(content)}
      onUpdate={(content) => handleUpdate(content)}
    />
    {/* <Editor
        content={loadedTemplate?.template || ''}
        onDelete={() => handleDelete(template_id)}
        // onUpdate={(content) => setNewTemplateContent(content)}
        onUpdate={(content) => handleUpdate(content)}
      /> */}
  </div>
}

export default TemplateManager;
//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Your Templates</h2>

//       {loading && <p>Loading templates...</p>}
//       {error && <p className="text-red-500">Error: {error}</p>}

//       {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
//       <button onClick={() => setIsCreating(true)} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
//         Create New Template
//       </button>

//       {isCreating && (
//         <div className="mb-4 p-4 border rounded">
//           <h3 className="text-lg font-semibold mb-2">Create New Template</h3>
//           <input
//             type="text"
//             placeholder="Template Name"
//             value={newTemplateName}
//             onChange={(e) => setNewTemplateName(e.target.value)}
//             className="w-full mb-2 p-2 border rounded"
//           />
//           {/* <Editor
//             content={newTemplateContent}
//             onUpdate={(content) => setNewTemplateContent(content)}
//           /> */}
//           <div className="mt-2 flex gap-2">
//             {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
//             <button onClick={() => { }} className="px-4 py-2 bg-green-500 text-white rounded">
//               Save
//             </button>
//             {/* <button onClick={() => { setIsCreating(false); setNewTemplateName(''); setNewTemplateContent(''); }} className="px-4 py-2 bg-gray-500 text-white rounded">
//               Cancel
//             </button> */}
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {/* biome-ignore lint/complexity/useOptionalChain: <explanation> */}
//         {templates && templates.map((template) => (
//           <div key={template.id} className="border rounded p-4 shadow">
//             <h3 className="text-lg font-semibold">{template.name}</h3>
//             {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
//             {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
//             <div className="mt-2 mb-4" dangerouslySetInnerHTML={{ __html: template.template }}></div>
//             <div className="flex justify-between">
//               {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
//               <button onClick={() => { setSelectedTemplate(template); setIsEditing(true); }} className="px-3 py-1 bg-yellow-500 text-white rounded">
//                 Edit
//               </button>
//               {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
//               <button onClick={() => handleDelete(template.id)} className="px-3 py-1 bg-red-500 text-white rounded">
//                 Delete
//               </button>
//               {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
//               <button onClick={() => { setShareTemplateId(template.id); setShowShareModal(true); }} className="px-3 py-1 bg-blue-500 text-white rounded">
//                 Share
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Edit Template Modal */}
//       {isEditing && selectedTemplate && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded w-3/4">
//             <h3 className="text-lg font-semibold mb-2">Edit Template</h3>
//             <input
//               type="text"
//               value={selectedTemplate.name}
//               onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
//               className="w-full mb-2 p-2 border rounded"
//             />
//             {/* <Editor
//               content={selectedTemplate.template}
//               onUpdate={(content) => setSelectedTemplate({ ...selectedTemplate, template: content })}
//             /> */}
//             <div className="mt-2 flex gap-2">
//               {/* <button onClick={handleUpdate} className="px-4 py-2 bg-green-500 text-white rounded">
//                 Save
//               </button> */}
//               {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
//               <button onClick={() => { setIsEditing(false); setSelectedTemplate(null); }} className="px-4 py-2 bg-gray-500 text-white rounded">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Share Template Modal */}
//       {showShareModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded w-1/3">
//             <h3 className="text-lg font-semibold mb-2">Share Template</h3>
//             <input
//               type="text"
//               placeholder="User ID to share with"
//               value={shareUserId}
//               onChange={(e) => setShareUserId(e.target.value)}
//               className="w-full mb-2 p-2 border rounded"
//             />
//             <div className="mt-2 flex gap-2">
//               {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
//               <button onClick={handleShare} className="px-4 py-2 bg-blue-500 text-white rounded">
//                 Share
//               </button>
//               {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
//               <button onClick={() => { setShowShareModal(false); setShareUserId(''); setShareTemplateId(''); }} className="px-4 py-2 bg-gray-500 text-white rounded">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


