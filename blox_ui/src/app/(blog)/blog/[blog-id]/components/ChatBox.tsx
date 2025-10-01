import { TextFieldUnstyled } from '@/components/ui/TextFieldUnstyled';
import { IconButton } from '@/components/ui/IconButton';
import { FeatherSend } from '@subframe/core';
import { useBlogStore } from '@/stores/blogStore';
import { useApiClient } from '@/lib/api/useApiClient';
import Loading from '@/components/ui/Loading';

import MessageBox from './MessageBox';
import { useRef, useState } from 'react';
import SelectBlockBadge from './SelectedBlockBadge';
import CheckpointBadge from './CheckpointBadge';
import CreateCheckpointButton from './CreateCheckpointButton';

const ChatBox = () => {
  const apiClient = useApiClient();
  const selectedBlocks = useBlogStore((state) => state.selectedBlocks);
  const chatLoading = useBlogStore((state) => state.chatLoading);
  const workingOnBlog = useBlogStore((state) => state.workingOnBlog);
  const editingBlog = useBlogStore((state) => state.editingBlog);
  const currentBlog = useBlogStore((state) => state.currentBlog);
  const sendMessage = useBlogStore((state) => state.sendMessage);
  const messages = useBlogStore((state) => state.messages);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [prompt, setPrompt] = useState('');

  const sendMessageHandler = async () => {
    if (prompt && currentBlog) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      
      try {
        // Prepare message data
        const messageData = {
          title: currentBlog.title,
          description: currentBlog.description,
          desired_tone: currentBlog.desired_tone,
          seo_keywords: currentBlog.seo_keywords,
          target_audience: currentBlog.target_audience,
          blog_length_min: currentBlog.blog_length_min,
          blog_length_max: currentBlog.blog_length_max,
          user_message: prompt,
          selected_context: selectedBlocks.map((block) => block.content),
          blog_id: currentBlog.id,
        };
        
        // Send message to API - messages will be handled by the store
        await sendMessage(apiClient, messageData);
        
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setPrompt('');
      }
    }
  };

  // Only show big loader for initial chat loading, not for message sending
  if (chatLoading) {
    return (
      <Loading type="page" variant="brand-secondary" size="medium">
        <span className="text-body text-neutral-600">Loading. Hold on...</span>
      </Loading>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-122px)] overflow-y-auto p-4">
        <div className="flex w-full flex-col items-center justify-end gap-3 ">
          {messages.map((msg, index) => (
            <div key={index} className="w-full flex flex-col items-center gap-1">
              <MessageBox time={msg.time} message={msg.message} type={msg.type} />
              {msg.type === 'received' && msg.checkpointId && (
                <CheckpointBadge 
                  checkpointId={msg.checkpointId} 
                />
              )}
            </div>
          ))}
          {workingOnBlog && (
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50/50 rounded-md border border-neutral-200/50 w-full max-w-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-neutral-600 font-medium">AI is working...</span>
            </div>
          )}
          {!workingOnBlog && messages.length > 0 && messages[messages.length - 1].type === 'received' && !messages[messages.length - 1].checkpointId && messages[messages.length - 1].messageId && (
            <CreateCheckpointButton messageId={messages[messages.length - 1].messageId!} />
          )}
        </div>
        <div ref={bottomRef} />
      </div>
      <div className="w-full flex gap-1 px-1">
        {selectedBlocks.map((block, index) => (
          <SelectBlockBadge text={block.content} key={index} />
        ))}
        {!selectedBlocks.length && (
          <SelectBlockBadge text={'Select any blog section to attach as context'} />
        )}
      </div>
      <div className={`flex w-full items-center gap-2 border-t border-solid border-neutral-border px-3 py-2 transition-opacity duration-200 ${workingOnBlog ? 'opacity-60' : ''}`}>
        <TextFieldUnstyled className="h-auto grow shrink-0 basis-0">
          <TextFieldUnstyled.Input
            placeholder={workingOnBlog ? "AI is processing your request..." : "Type your message..."}
            disabled={workingOnBlog || editingBlog}
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPrompt(e.target.value);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessageHandler();
              }
            }}
          />
        </TextFieldUnstyled>
        <IconButton
          variant="brand-primary"
          icon={<FeatherSend />}
          onClick={sendMessageHandler}
          size="medium"
          disabled={workingOnBlog || editingBlog}
        />
      </div>
    </>
  );
};

export default ChatBox;
