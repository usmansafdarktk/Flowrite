'use client';
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/8e5300ed4201/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 */

import React from 'react';
import * as SubframeUtils from '../../lib/utils/subframe';

interface DefaultPageLayoutRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const DefaultPageLayoutRoot = React.forwardRef<HTMLElement, DefaultPageLayoutRootProps>(
  function DefaultPageLayoutRoot(
    { children, className, ...otherProps }: DefaultPageLayoutRootProps,
    ref,
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          'flex h-screen w-full flex-col items-center',
          className,
        )}
        ref={ref as any}
        {...otherProps}
      >
        {children ? (
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start overflow-y-auto bg-default-background">
            {children}
          </div>
        ) : null}
      </div>
    );
  },
);

export const DefaultPageLayout = DefaultPageLayoutRoot;
