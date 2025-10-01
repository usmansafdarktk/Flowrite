'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from './Button';
import Logo from './Logo';

const Navbar = () => {
  const router = useRouter();
  return (
    <nav className="w-full px-4 py-4 bg-neutral-50 border-b border-solid border-neutral-border">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-body-bold font-body-bold text-default-font">BloX</span>
          </div>
        </Link>
        <Button
          variant="brand-tertiary"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            router.push('/signin');
          }}
        >
          Write a Blog!
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
