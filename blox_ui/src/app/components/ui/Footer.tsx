'use client';

import { FeatherTwitter, FeatherGithub, FeatherLinkedin } from '@subframe/core';
import Link from 'next/link';
import Logo from './Logo';
import { Badge } from './Badge';

const Footer = () => {
  return (
    <footer className="flex w-full flex-col items-center justify-center border-t border-solid border-neutral-border bg-black px-6 py-12 font-body">
      <div className="max-w-6xl mx-auto text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center mb-4">
          <span className="text-white text-xl font-semibold">
            <span className="flex items-center justify-center">
              <Logo size={32} />
              <span className="ml-2">BloX</span>
            </span>
          </span>
        </Link>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 max-w-2xl mx-auto">
          An XGrid product. Empowering bloggers with AI-driven content tools.
        </p>

        {/* Address */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm">
            <span className="font-bold">US Address: </span>
            Plug and Play Tech Center, 440 N Wolfe Rd, Sunnyvale, CA 94085
          </p>
          <p className="text-gray-500 text-sm">
            <span className="font-bold">Pakistan Address: </span>
            Xgrid Solutions (Private) Limited, Bldg 96, GCC-11, Civic Center, Gulberg Greens,
            Islamabad | Xgrid Solutions (Pvt) Ltd, Daftarkhwan (One), Building #254/1, Sector G,
            Phase 5, DHA, Lahore
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center space-x-6">
          <Link
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Badge icon={<FeatherTwitter />} variant="neutral" />
          </Link>
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Badge icon={<FeatherLinkedin />} variant="neutral" />
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Badge icon={<FeatherGithub />} variant="neutral" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
