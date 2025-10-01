'use client';
/*
 * Documentation:
 * OAuth Social Button — https://app.subframe.com/8e5300ed4201/library?component=OAuth+Social+Button_f1948f75-65f9-4f21-b3e4-a49511440c26
 */

import React from 'react';
import * as SubframeUtils from '../../../lib/utils/subframe';

interface OAuthSocialButtonRootProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  logo?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const OAuthSocialButtonRoot = React.forwardRef<HTMLElement, OAuthSocialButtonRootProps>(
  function OAuthSocialButtonRoot(
    { children, logo, className, type = 'button', ...otherProps }: OAuthSocialButtonRootProps,
    ref,
  ) {
    return (
      <button
        className={SubframeUtils.twClassNames(
          'group/f1948f75 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-solid border-neutral-border bg-black px-4 hover:bg-neutral-50 active:bg-black disabled:cursor-default disabled:bg-black hover:disabled:cursor-default hover:disabled:bg-black active:disabled:cursor-default active:disabled:bg-black',
          className,
        )}
        ref={ref as any}
        type={type}
        {...otherProps}
      >
        {logo ? <img className="h-5 w-5 flex-none object-cover" src={logo} /> : null}
        {children ? (
          <span className="text-body-bold font-body-bold text-neutral-700 group-disabled/f1948f75:text-neutral-400">
            {children}
          </span>
        ) : null}
      </button>
    );
  },
);

export const OAuthSocialButton = OAuthSocialButtonRoot;
