// src/components/Editor.tsx
import type React from 'react';
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
import TemplateBuilder from './TemplateBuilder';

interface EditorProps {
  content: string;
  name: string;
  description?: string;
  template_id: string;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

const Editor: React.FC<EditorProps> = ({ content, onUpdate,onDelete, name, description, template_id }) => {
    console.info('content:', content);
    console.info('onUpdate:', onUpdate);
//   const editor = useEditor({
//     extensions: [StarterKit],
//     content,
//     onUpdate: ({ editor }) => {
//       const html = editor.getHTML();
//       onUpdate(html);
//     },
//   });

  return <TemplateBuilder 
    content={content}
    onUpdate={onUpdate}
    onDelete={onDelete}
    name={name}
    description={description}
    template_id={template_id}
  />;
//   return <EditorContent editor={editor} />;
};

export default Editor;
