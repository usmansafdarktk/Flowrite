'use client';

import { EditorContext, EditorContent, useEditor, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Markdown } from 'tiptap-markdown';
// import { Underline } from "@tiptap/extension-underline"
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
// import { Highlight } from "@tiptap/extension-highlight"
import { Typography } from '@tiptap/extension-typography';
// import { Subscript } from "@tiptap/extension-subscript"
// import { Superscript } from "@tiptap/extension-superscript"
import { TrailingNode } from './trailing-node-extension';
// import Link from "@/app/components/tiptap-extension/link-extension"
import { useBlogStore } from '@/stores/blogStore';
import EditorToolBar from './EditorToolBar';
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

export default function SimpleEditor() {
  const content = useBlogStore((state) => state.markdown);
  const setEditedMarkdown = useBlogStore((state) => state.setEditedMarkdown);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Markdown.configure(),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      // Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      // Highlight.configure({ multicolor: true }),
      // Image,
      Typography,
      // Superscript,
      // Subscript,

      // Selection,
      // ImageUploadNode.configure({
      //   accept: "image/*",
      //   maxSize: MAX_FILE_SIZE,
      //   limit: 3,
      //   upload: handleImageUpload,
      //   onError: (error) => console.error("Upload failed:", error),
      // }),
      TrailingNode,
      // Link.configure({ openOnClick: false }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setEditedMarkdown(editor.storage.markdown.getMarkdown());
    },
  });

  return (
    <div className="flex items-center justify-center">
      <div className="prose w-full px-5 outline-none">
        <EditorContext.Provider value={{ editor }}>
          <EditorToolBar />
          <div className="outline-none">
            <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
          </div>
        </EditorContext.Provider>
      </div>
    </div>
  );
}
