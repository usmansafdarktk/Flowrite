'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { DefaultPageLayout } from '@/layouts/DefaultPageLayout';
import TopBar from './blog/[blog-id]/components/TopBar';
import WindowDrawer from './blog/[blog-id]/components/WindowDrawer';
import LeftWindow from './blog/[blog-id]/components/LeftWindow';
import { useAuthStore } from '@/src/stores/authStore';  

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const unauthorized = useAuthStore((state) => state.unauthorized);
  const router = useRouter();

  useEffect(() => {
    if (unauthorized) {
      router.push("/");
    }
  }, [unauthorized]);

  return (
    <DefaultPageLayout>
      <div className="h-screen flex w-full flex-col items-start bg-default-background">
        <TopBar />
        <div className="flex w-full flex-wrap items-start flex-row gap-0">
          <WindowDrawer width={15} icon="FeatherSidebar" side="left">
            <LeftWindow />
          </WindowDrawer>
          {children}
        </div>
      </div>
    </DefaultPageLayout>
  );
}
