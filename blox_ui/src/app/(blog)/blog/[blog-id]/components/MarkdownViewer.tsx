'use client';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseMarkdownBlocks } from '../utils/parseMarkdown';
import { useBlogStore } from '@/stores/blogStore';
import { MarkdownBlock } from '@/src/lib/api/blog';

const MarkdownViewer = () => {
  const markdown = useBlogStore((state) => state.markdown);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<MarkdownBlock[]>([]);
  const addBlock = useBlogStore((state) => state.addSelectedBlock);
  const removeBlock = useBlogStore((state) => state.removeSelectedBlock);
  const selectedBlocks = useBlogStore((state) => state.selectedBlocks);

  useEffect(() => {
    setBlocks(() => parseMarkdownBlocks(markdown));
    removeBlock('ALL');

    return () => {
      setBlocks([]);
    };
  }, []);

  const handleClick = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (block) {
      const index = selectedBlocks.findIndex((el) => el.id === block.id);
      if (index > -1) {
        removeBlock(block.id);
        setSelectedBlockIds((prevIds) => prevIds.filter((id) => id !== block.id));
      } else {
        addBlock({ id: block.id, content: block.content });
        setSelectedBlockIds([...selectedBlockIds, block.id]);
      }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="prose w-full px-5">
        {/* <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> */}
        {blocks.map((block) => (
          <div
            key={block.id}
            onClick={() => handleClick(block.id)}
            className={`hover:bg-white/10 cursor-pointer ${selectedBlockIds.includes(block.id) ?? 'bg-white/20'}`}
            style={{
              backgroundColor: `${selectedBlockIds.includes(block.id) ? 'rgb(255 255 255 / 0.2)' : ''}`,
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content}</ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarkdownViewer;
