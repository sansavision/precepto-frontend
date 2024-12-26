// src/components/Editor.tsx
import type React from 'react';
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
import TemplateBuilder from './TemplateBuilder';

interface EditorProps {
  content: string;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

const Editor: React.FC<EditorProps> = ({ content, onUpdate,onDelete }) => {
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
  />;
//   return <EditorContent editor={editor} />;
};

export default Editor;
