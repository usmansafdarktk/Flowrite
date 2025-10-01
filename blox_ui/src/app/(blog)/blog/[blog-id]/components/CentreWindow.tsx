import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import MarkdownViewer from './MarkdownViewer';
import BlogPlaceholder from './BlogPlaceholder';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import MarkDownEditor from './blog-editor/Editor';

import { useBlogStore } from '@/stores/blogStore';
import { useApiClient } from '@/lib/api/useApiClient';

const CentreWindow = () => {
  const params = useParams();
  const apiClient = useApiClient();
  const blogId = params['blog-id'] as string;

  const loading = useBlogStore((state) => state.blogLoading);
  const setLoading = useBlogStore((state) => state.updateBlogLoading);
  const workingOnBlog = useBlogStore((state) => state.workingOnBlog);
  const setWorkingOnBlog = useBlogStore((state) => state.setWorkingOnBlog);
  const editingBlog = useBlogStore((state) => state.editingBlog);
  const setEditingBlog = useBlogStore((state) => state.setEditingBlog);
  const editedMarkdown = useBlogStore((state) => state.editedMarkdown);
  const setEditedMarkdown = useBlogStore((state) => state.setEditedMarkdown);
  const markdown = useBlogStore((state) => state.markdown);
  const updateMarkdown = useBlogStore((state) => state.updateMarkdown);
  const activeBlogId = useBlogStore((state) => state.activeBlogId);
  const setActiveBlogId = useBlogStore((state) => state.setActiveBlogId);
  const getBlog = useBlogStore((state) => state.getBlog);
  const updateBlog = useBlogStore((state) => state.updateBlog);

  /**
   * Fetches blog based on blog id
   */
  const loadBlog = async () => {
    try {
      setLoading(true);
      const blogData = await getBlog(apiClient, parseInt(blogId));
      updateMarkdown(blogData.content);
    } catch (error) {
      console.error('Failed to load blog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveBlogId(blogId);
    setLoading(true);

    if (blogId === 'new') setLoading(false);
    else loadBlog();

    return () => {
      updateMarkdown('');
      setLoading(true);
    };
  }, []);

  /**
   * Saved changes to the blog
   */
  const saveEditedChanges = async () => {
    try {
      setWorkingOnBlog(true);
      if (editedMarkdown && activeBlogId !== 'new') {
        await updateBlog(apiClient, parseInt(activeBlogId), { content: editedMarkdown });
        setEditedMarkdown('');
      }
    } catch (error) {
      console.error('Failed to save blog:', error);
    } finally {
      setWorkingOnBlog(false);
    }
  };

  // Only show big loader for initial blog loading, not for chat operations
  if (loading) {
    return (
      <Loading type="page" variant="brand-secondary" size="medium">
        <span className="text-body text-neutral-600">
          Loading. Hold on...
        </span>
      </Loading>
    );
  }

  return (
    <div>
      {activeBlogId === 'new' && <BlogPlaceholder />}

      {activeBlogId !== 'new' && (
        <>
          {!!markdown && (
            <div className="px-5 sticky w-full top-0 z-50">
              {editingBlog ? (
                <div className="flex w-full mx-auto items-center justify-center gap-2">
                  <Button
                    size="medium"
                    variant="brand-secondary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                      setEditingBlog(false);
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    size="medium"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                      setEditingBlog(false);
                      saveEditedChanges();
                    }}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  className="mx-auto"
                  size="medium"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => setEditingBlog(true)}
                >
                  Edit Manually
                </Button>
              )}
            </div>
          )}

          {!editingBlog && <MarkdownViewer />}
          {editingBlog && <MarkDownEditor />}
        </>
      )}
    </div>
  );
};

export default CentreWindow;
