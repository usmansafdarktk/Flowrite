import { IconButton } from '@/components/ui/IconButton';
import { FeatherRotateCcw, FeatherEye } from '@subframe/core';
import { useBlogStore } from '@/stores/blogStore';
import { useApiClient } from '@/lib/api/useApiClient';
import { useState } from 'react';
import ViewCheckpointDialog from './ViewCheckpointDialog';

const CheckpointBadge = ({ checkpointId }: { checkpointId: number }) => {
  const apiClient = useApiClient();
  const restoreCheckpoint = useBlogStore((state) => state.restoreCheckpoint);
  const workingOnBlog = useBlogStore((state) => state.workingOnBlog);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleRestore = async () => {
    if (isRestoring || workingOnBlog) return;
    
    const confirmed = window.confirm(
      'Restore this checkpoint? This will remove all messages after this point.'
    );
    
    if (!confirmed) return;

    try {
      setIsRestoring(true);
      await restoreCheckpoint(apiClient, checkpointId);
    } catch (error) {
      console.error('Failed to restore checkpoint:', error);
      alert('Failed to restore checkpoint. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-50/50 rounded-md border border-neutral-200/50 w-full max-w-sm">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-neutral-600 font-medium">Checkpoint</span>
        </div>
        <div className="flex gap-1">
          <IconButton
            variant="neutral-tertiary"
            icon={<FeatherEye />}
            size="small"
            disabled={workingOnBlog || isRestoring}
            onClick={() => setIsViewDialogOpen(true)}
            title="View checkpoint"
          />
          <IconButton
            variant="neutral-tertiary"
            icon={<FeatherRotateCcw />}
            size="small"
            onClick={handleRestore}
            disabled={workingOnBlog || isRestoring} 
            title="Restore checkpoint"
          />
        </div>
      </div>
      
      <ViewCheckpointDialog
        checkpointId={checkpointId}
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
      />
    </>
  );
};

export default CheckpointBadge;
