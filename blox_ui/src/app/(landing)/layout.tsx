import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { DefaultPageLayout } from '@/layouts/DefaultPageLayout';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultPageLayout>
      <Navbar />
      {children}
      <Footer />
    </DefaultPageLayout>
  );
}
