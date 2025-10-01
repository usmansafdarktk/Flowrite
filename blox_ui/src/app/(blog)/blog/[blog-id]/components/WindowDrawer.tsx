'use client';

import { IconButton } from '@/components/ui/IconButton';
import { ForwardRefExoticComponent, HTMLAttributes, RefAttributes, useState } from 'react';
import * as SubframeCore from '@subframe/core';

const WindowDrawer = ({
  width,
  icon,
  side,
  children,
}: {
  width: number;
  icon: 'FeatherSidebar';
  side: 'left' | 'right';
  children: React.ReactNode;
}) => {
  // const isMobile = window.innerWidth < 768; todo
  const [isOpen, setIsOpen] = useState(true);
  const Icon: ForwardRefExoticComponent<
    HTMLAttributes<HTMLSpanElement> & RefAttributes<HTMLSpanElement>
  > = SubframeCore[icon];

  return (
    <>
      <div
        className={`flex flex-col items-start overflow-y-hidden justify-between h-[calc(100vh-57px)] fixed md:relative md:transform-none transform transition-all duration-300 ${isOpen ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full'} border-r border-solid border-neutral-border bg-default-background`}
        style={{
          width: isOpen ? `${width}rem` : '0',
          [side]: 0,
        }}
      >
        <div
          className={`w-full border-l border-solid border-neutral-border h-full overflow-y-auto ${!isOpen ? 'invisible' : ''}`}
        >
          {children}
        </div>
      </div>
      <div
        className={`z-50 transition-all duration-300 top-[67px] fixed`}
        style={{
          [side]: isOpen ? `${width + 0.5}rem` : '0.5rem',
        }}
      >
        <IconButton
          icon={<Icon />}
          size="medium"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-defaimagesult-background shadow-md"
        />
      </div>
    </>
  );
};

export default WindowDrawer;
