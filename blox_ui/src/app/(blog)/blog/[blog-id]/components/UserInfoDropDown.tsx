'use client';
import { useRouter } from 'next/navigation';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import DropdownMenuWrapper from '@/components/ui/DropDownWrapper';

import { useApiClient } from '@/src/lib/api/useApiClient';
import { useAuthStore } from '@/src/stores/authStore';

const UserDropDownAvatar = () => {
  const authStore = useAuthStore();
  const client = useApiClient();
  const Router = useRouter();

  /**
   * Calls logout utlity function and reroute to home
   */
  const logout = () => {
    try {
      authStore.logout(client);
      Router.push('/');
    } catch (error) {
      // ignore
    }
  };

  return (
    <DropdownMenuWrapper
      trigger={
        <Avatar
          className="cursor-pointer"
          size="medium"
          image="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif"
        >
          A
        </Avatar>
      }
      content={
        <div className="flex flex-col items-center justify-center gap-3 bg-brand-50 text-default-font text-body p-2 w-64 rounded-sm border border-solid border-neutral-border">
          <span>Hope you are enjoying your stay!</span>
          <Avatar
          className="cursor-pointer"
          size="large"
          image="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif"
        >
          A
        </Avatar>
          <span>
            <span className="font-semibold">Name: </span>{authStore.user?.username}
          </span>
          <span>
            <span className="font-semibold">Email: </span>{authStore.user?.email}
          </span>
          <Button
            variant="brand-primary"
            className="justify-self-end text-default-font"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      }
    />
  );
};

export default UserDropDownAvatar;
