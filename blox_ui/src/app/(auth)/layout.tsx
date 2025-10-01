import { DefaultPageLayout } from '@/layouts/DefaultPageLayout';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <DefaultPageLayout>{children}</DefaultPageLayout>;
}
