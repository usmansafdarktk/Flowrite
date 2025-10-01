// showToast.tsx
import { toast } from '@subframe/core';
import { Toast } from '@/components/ui/Toast';
import * as SubframeCore from '@subframe/core';

export const showErrorToast = (title: string | null = "Something needs your attention!", msg?: string) => {
  toast.custom(() => (
    <Toast
      icon={<SubframeCore.FeatherXCircle />}
      variant="neutral"
      title={title}
      description={msg}
      className="bg-error-200"
    />
  ));
};
