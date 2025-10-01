import { DialogLayout } from '@/src/ui/layouts/DialogLayout';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { FeatherX, FeatherRotateCcw } from '@subframe/core';
import { useBlogStore } from '@/stores/blogStore';
import { useApiClient } from '@/lib/api/useApiClient';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ViewCheckpointDialogProps {
  checkpointId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ViewCheckpointDialog = ({ checkpointId, isOpen, onClose }: ViewCheckpointDialogProps) => {
  const apiClient = useApiClient();
  const getCheckpoint = useBlogStore((state) => state.getCheckpoint);
  const restoreCheckpoint = useBlogStore((state) => state.restoreCheckpoint);
  const workingOnBlog = useBlogStore((state) => state.workingOnBlog);
  
  const [checkpoint, setCheckpoint] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (isOpen && checkpointId) {
      fetchCheckpoint();
    }
  }, [isOpen, checkpointId]);

  const fetchCheckpoint = async () => {
    try {
      setLoading(true);
      const checkpointData = await getCheckpoint(apiClient, checkpointId);
      setCheckpoint(checkpointData);
    } catch (error) {
      console.error('Failed to fetch checkpoint:', error);
      alert('Failed to load checkpoint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (isRestoring || workingOnBlog) return;
    
    const confirmed = window.confirm(
      'Restore this checkpoint? This will remove all messages after this point.'
    );
    
    if (!confirmed) return;

    try {
      setIsRestoring(true);
      await restoreCheckpoint(apiClient, checkpointId);
      onClose();
    } catch (error) {
      console.error('Failed to restore checkpoint:', error);
      alert('Failed to restore checkpoint. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <DialogLayout open={isOpen} onOpenChange={onClose}>
      <div className="flex flex-col h-[80vh] w-full max-w-4xl">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Checkpoint Preview</h2>
          <IconButton
            variant="neutral-tertiary"
            icon={<FeatherX />}
            size="small"
            onClick={onClose}
            title="Close"
          />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-neutral-600">Loading checkpoint...</div>
            </div>
          ) : checkpoint ? (
            <div className="prose prose-neutral max-w-none">
              {/* <div 
                className="whitespace-pre-wrap text-neutral-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: checkpoint.content || 'No content available' }}
              /> */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{checkpoint.content}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-neutral-600">No checkpoint data available</div>
            </div>
          )}
        </div>

        {/* Fixed footer with restore button */}
        <div className="flex items-center justify-end p-4 border-t border-neutral-200 bg-neutral-50">
          <Button
            variant="brand-primary"
            icon={<FeatherRotateCcw />}
            onClick={handleRestore}
            disabled={workingOnBlog || isRestoring || loading}
            loading={isRestoring}
          >
            {isRestoring ? 'Restoring...' : 'Restore Checkpoint'}
          </Button>
        </div>
      </div>
    </DialogLayout>
  );
};

export default ViewCheckpointDialog;
