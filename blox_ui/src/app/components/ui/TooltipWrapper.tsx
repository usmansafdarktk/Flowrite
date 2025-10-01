'use client';

import React from 'react';
import { Tooltip } from './Tooltip';
import * as SubframeCore from '@subframe/core';

function TooltipWrapper({
  children,
  tooltipText,
}: {
  children: React.ReactNode;
  tooltipText: string;
}) {
  return (
    <SubframeCore.Tooltip.Provider>
      <SubframeCore.Tooltip.Root>
        <SubframeCore.Tooltip.Trigger asChild>{children}</SubframeCore.Tooltip.Trigger>
        <SubframeCore.Tooltip.Portal>
          <SubframeCore.Tooltip.Content side="bottom" align="center" sideOffset={8} asChild>
            <Tooltip>{tooltipText}</Tooltip>
          </SubframeCore.Tooltip.Content>
        </SubframeCore.Tooltip.Portal>
      </SubframeCore.Tooltip.Root>
    </SubframeCore.Tooltip.Provider>
  );
}

export default TooltipWrapper;
