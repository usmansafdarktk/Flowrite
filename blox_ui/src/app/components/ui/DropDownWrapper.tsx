'use client';

import React from 'react';
import * as SubframeCore from '@subframe/core';

type DropdownMenuWrapperProps = {
  trigger: React.ReactNode;
  content: React.ReactNode;
};

function DropdownMenuWrapper({ trigger, content }: DropdownMenuWrapperProps) {
  return (
    <SubframeCore.DropdownMenu.Root>
      <SubframeCore.DropdownMenu.Trigger asChild={true}>
        {trigger}
      </SubframeCore.DropdownMenu.Trigger>
      <SubframeCore.DropdownMenu.Portal>
        <SubframeCore.DropdownMenu.Content side="bottom" align="end" sideOffset={4} asChild={true}>
          {content}
        </SubframeCore.DropdownMenu.Content>
      </SubframeCore.DropdownMenu.Portal>
    </SubframeCore.DropdownMenu.Root>
  );
}

export default DropdownMenuWrapper;
