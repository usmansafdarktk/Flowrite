import { useEffect, useState } from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Select } from '@/components/ui/Select';

type Level = 1 | 2 | 3 | 4 | 5 | 6;

const HeadingDropDown = () => {
  const { editor } = useCurrentEditor();
  const [textLevel, setTextLevel] = useState('P');
  const levels: Level[] = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    if (!editor) return;

    const updateHeadingLevel = () => {
      const level = levels.find((level) => editor.isActive('heading', { level }));
      console.log(level);
      if (level) {
        setTextLevel('H' + level);
      } else {
        setTextLevel('P');
      }
    };

    editor.on('selectionUpdate', updateHeadingLevel);

    return () => {
      editor.off('selectionUpdate', updateHeadingLevel);
    };
  }, [editor]);

  const setValue = (value: string) => {
    if (value === "P") {
        editor?.chain().focus().setParagraph().run();
    }

    const level: Level = Number(value.slice(1)) as Level;
    editor?.chain().focus().toggleHeading({ level }).run();
  };

  if (!editor) return null;

  return (
    <Select value={textLevel} onValueChange={setValue} placeholder="Make a selection...">
      <Select.Item value={'P'} />
      {levels.map((level) => (
        <Select.Item value={'H' + level} key={'H' + level} />
      ))}
    </Select>
  );
};

export default HeadingDropDown;
