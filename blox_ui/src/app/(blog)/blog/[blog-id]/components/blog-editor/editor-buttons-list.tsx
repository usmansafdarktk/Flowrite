// editorButtons.ts
import { Editor } from "@tiptap/react";
import * as SubframeCore from "@subframe/core";
import HeadingDropDown from "./HeadingDropDown";

export interface EditorButtonItem {
  tooltip: string;
  icon?: React.ReactNode;
  command?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  custom?: React.ReactNode;
}

export interface EditorButtonGroup {
  group: string;
  items: EditorButtonItem[];
}

export const getEditorButtonsList = (editor: Editor): EditorButtonGroup[] => {
  const chain = () => editor.chain().focus();
  const can = () => editor.can().chain().focus();

  return [
    {
      group: "history",
      items: [
        {
          tooltip: "Undo",
          icon: <SubframeCore.FeatherUndo />,
          command: () => chain().undo().run(),
          disabled: !can().undo().run(),
        },
        {
          tooltip: "Redo",
          icon: <SubframeCore.FeatherRedo />,
          command: () => chain().redo().run(),
          disabled: !can().redo().run(),
        },
      ],
    },
    {
      group: "formatting",
      items: [
        {
          custom: <HeadingDropDown />,
          tooltip: "Text Level",
        },
        {
          tooltip: "Bullet List",
          icon: <SubframeCore.FeatherList />,
          command: () => chain().toggleBulletList().run(),
          isActive: editor.isActive("bulletList"),
        },
        {
          tooltip: "Ordered List",
          icon: <SubframeCore.FeatherListOrdered />,
          command: () => chain().toggleOrderedList().run(),
          isActive: editor.isActive("orderedList"),
        },
        {
          tooltip: "Bold",
          icon: <SubframeCore.FeatherBold />,
          command: () => chain().toggleBold().run(),
          isActive: editor.isActive("bold"),
          disabled: !can().toggleBold().run(),
        },
        {
          tooltip: "Italic",
          icon: <SubframeCore.FeatherItalic />,
          command: () => chain().toggleItalic().run(),
          isActive: editor.isActive("italic"),
          disabled: !can().toggleItalic().run(),
        },
        {
          tooltip: "Strike Through",
          icon: <SubframeCore.FeatherStrikethrough />,
          command: () => chain().toggleStrike().run(),
          isActive: editor.isActive("strike"),
          disabled: !can().toggleStrike().run(),
        },
        {
          tooltip: "Code",
          icon: <SubframeCore.FeatherCode2 />,
          command: () => chain().toggleCode().run(),
          isActive: editor.isActive("code"),
          disabled: !can().toggleCode().run(),
        },
        {
          tooltip: "Code Block",
          icon: <SubframeCore.FeatherSquareCode />,
          command: () => chain().setCodeBlock().run(),
          isActive: editor.isActive("codeBlock"),
        },
        {
          tooltip: "Block Quote",
          icon: <SubframeCore.FeatherQuote />,
          command: () => chain().toggleBlockquote().run(),
          isActive: editor.isActive("blockquote"),
        },
      ],
    },
    {
      group: "alignment",
      items: [
        {
          tooltip: "Align Left",
          icon: <SubframeCore.FeatherAlignLeft />,
          command: () => chain().setTextAlign("left").run(),
          isActive: editor.isActive({ textAlign: "left" }),
        },
        {
          tooltip: "Align Center",
          icon: <SubframeCore.FeatherAlignCenter />,
          command: () => chain().setTextAlign("center").run(),
          isActive: editor.isActive({ textAlign: "center" }),
        },
        {
          tooltip: "Align Right",
          icon: <SubframeCore.FeatherAlignRight />,
          command: () => chain().setTextAlign("right").run(),
          isActive: editor.isActive({ textAlign: "right" }),
        },
        {
          tooltip: "Align Justify",
          icon: <SubframeCore.FeatherAlignJustify />,
          command: () => chain().setTextAlign("justify").run(),
          isActive: editor.isActive({ textAlign: "justify" }),
        },
      ],
    },
  ];
};
