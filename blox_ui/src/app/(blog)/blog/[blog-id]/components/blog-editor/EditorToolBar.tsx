// EditorToolBar.tsx
import { useCurrentEditor } from "@tiptap/react";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import EditorButton from "./EditorButton";
import { getEditorButtonsList, EditorButtonItem } from "./editor-buttons-list";
import { useState } from "react";

const Separator = () => (
  <div className="w-[0.06rem] h-[1.3rem] bg-neutral-500 mx-2" />
);

const EditorToolBar = () => {
  const { editor } = useCurrentEditor();
  const [isOpen, setIsOpen] = useState(false)
  setTimeout(() => {
    setIsOpen(true)
  }, 200);

  if (!editor) return null;

  const buttons = getEditorButtonsList(editor);

  return (
    <div className={`sticky z-50 top-10 w-full border-b border-neutral-border bg-brand-50 rounded-sm transform transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} `}>
      <div className="w-full flex gap-1 items-center justify-around p-1">
        {buttons.map((group, index) => (
          <div key={group.group} className="flex items-center gap-1">
            {group.items.map((btn: EditorButtonItem, idx) =>
              btn.custom ? (
                <TooltipWrapper key={idx} tooltipText={btn.tooltip}>
                  {btn.custom}
                </TooltipWrapper>
              ) : (
                <EditorButton
                  key={idx}
                  icon={btn.icon}
                  tooltip={btn.tooltip}
                  command={btn.command}
                  isActive={btn.isActive}
                  disabled={btn.disabled}
                />
              )
            )}
            {index < buttons.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorToolBar;
