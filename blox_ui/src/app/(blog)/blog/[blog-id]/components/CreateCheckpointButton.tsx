import { IconButton } from '@/components/ui/IconButton';
import { FeatherSave } from '@subframe/core';
import { useBlogStore } from '@/stores/blogStore';
import { useApiClient } from '@/lib/api/useApiClient';
import { useState } from 'react';

interface CreateCheckpointButtonProps {
  messageId: number;
}

const CreateCheckpointButton = ({ messageId }: CreateCheckpointButtonProps) => {
  const apiClient = useApiClient();
  const createCheckpoint = useBlogStore((state) => state.createCheckpoint);
  const addCheckpoint = useBlogStore((state) => state.addCheckpoint);
  const workingOnBlog = useBlogStore((state) => state.workingOnBlog);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCheckpoint = async () => {
    if (isCreating || workingOnBlog) return;

    try {
      setIsCreating(true);
      const checkpoint = await createCheckpoint(apiClient, messageId);
      addCheckpoint(checkpoint);
    } catch (error) {
      console.error('Failed to create checkpoint:', error);
      alert('Failed to create checkpoint. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-neutral-50/30 rounded-md border border-neutral-200/30 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></div>
        <span className="text-xs text-neutral-500 font-medium">Save checkpoint</span>
      </div>
      <IconButton
        variant="neutral-tertiary"
        icon={<FeatherSave />}
        size="small"
        onClick={handleCreateCheckpoint}
        disabled={workingOnBlog || isCreating}
        className="text-neutral-600 hover:text-neutral-700 hover:bg-neutral-100"
        title="Create checkpoint"
      />
    </div>
  );
};

export default CreateCheckpointButton;
