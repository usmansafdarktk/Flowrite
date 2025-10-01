'use client';
import { useEffect, useState } from 'react';
import * as SubframeCore from '@subframe/core';
import { useRouter } from 'next/navigation';

import TooltipWrapper from '@/components/ui/TooltipWrapper';
import { LinkButton } from '@/components/ui/LinkButton';
import Loading from '@/components/ui/Loading';

import { useBlogStore } from '@/stores/blogStore';
import { useApiClient } from '@/lib/api/useApiClient';

const LeftWindow = () => {
  const router = useRouter();
  const apiClient = useApiClient();
  
  const blogs = useBlogStore((state) => state.blogs);
  const listBlogs = useBlogStore((state) => state.listBlogs);
  const activeBlogId = useBlogStore((state) => state.activeBlogId);
  const setActiveBlogId = useBlogStore((state) => state.setActiveBlogId);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      await listBlogs(apiClient);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const onBlogClick = (id: string) => {
    if (activeBlogId !== id) {
      setActiveBlogId(id);
      router.push(`/blog/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full p-3 flex flex-col gap-2 overflow-x-hidden">
        <Loading type="page" variant="brand-secondary" size="medium">
          <span className="text-body text-neutral-600">Loading. Hold on...</span>
        </Loading>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-3 flex flex-col gap-2 overflow-x-hidden">
      <div className="mb-4">
        <TooltipWrapper tooltipText="Start writing a new blog">
          <div className="flex items-center gap-2 px-3">
            <SubframeCore.FeatherEdit className="flex-shrink-0 text-brand-700" />
            <LinkButton variant="neutral" onClick={() => onBlogClick('new')}>
              <span className="truncate text-caption font-caption text-brand-700">New Blog</span>
            </LinkButton>
          </div>
        </TooltipWrapper>
      </div>
      {blogs.map((blog) => (
        <TooltipWrapper tooltipText={blog.title} key={blog.id}>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 bg-brand-50 hover:bg-brand-100 rounded-md"
            onClick={() => onBlogClick(blog.id.toString())}
          >
            <SubframeCore.FeatherEdit3 className="flex-shrink-0 text-brand-700" />
            <span className="truncate text-caption font-caption text-brand-700">{blog.title}</span>
          </button>
        </TooltipWrapper>
      ))}
    </div>
  );
};

export default LeftWindow;
