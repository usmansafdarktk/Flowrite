'use client';
import React, { useEffect, useState } from 'react';

import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import UseDropDownAvatar from './UserInfoDropDown';
import { Button } from '@/components/ui/Button';
import { useParams } from 'next/navigation';
import { useBlogStore } from '@/stores/blogStore';
import DropdownMenuWrapper from '@/components/ui/DropDownWrapper';
import BlogDownloader from './BlogDownloader';

const TopBar = () => {
  const blogs = useBlogStore((state) => state.blogs);
  const activeBlogId = useBlogStore((state) => state.activeBlogId);
  const [activeBlogTitle, setActiveBlogTitle] = useState<string | undefined>("")

  // todo: think of some better logic
  useEffect(() => {
    const title = blogs.find(blog => blog.id === activeBlogId)?.title
    setActiveBlogTitle(title)
  }, [activeBlogId, blogs])

  return (
    <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-4 py-3">
      <div className="flex grow shrink-0 basis-0 items-center gap-4">
      <DropdownMenuWrapper
      trigger={
        <Button disabled={!!activeBlogTitle}>Download Blog</Button>

      }
      content={
        <BlogDownloader />
      }
    />
      </div>
      <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch">
        <Breadcrumbs>
          <Breadcrumbs.Item >Blog</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item active={true}>{activeBlogTitle ?? "New Draft"}</Breadcrumbs.Item>
        </Breadcrumbs>
      </div>
      <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2 self-stretch">
        <UseDropDownAvatar />
      </div>
    </div>
  );
};

export default TopBar;
