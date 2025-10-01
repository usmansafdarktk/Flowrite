import * as SubframeCore from '@subframe/core';
import * as SubframeUtils from '../../../lib/utils/subframe';

const Loading = ({
  variant,
  type,
  size,
  children,
}: {
  variant:
    | 'brand-tertiary'
    | 'brand-secondary'
    | 'destructive-tertiary'
    | 'destructive-secondary'
    | 'neutral-tertiary'
    | 'neutral-secondary'
    | 'neutral-primary';
  type: 'page';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
      <SubframeCore.Loader
        className={SubframeUtils.twClassNames(
          "text-body text-black group-disabled/3b777358:text-neutral-400 inline-block font-['Inter'] font-[400] leading-[20px] tracking-normal",
          {
            'text-caption font-caption': size === 'small',
            'text-[1rem]': size === 'small',
            'text-[2rem]': size === 'medium',
            'text-[3rem]': size === 'large',
            'text-error-700':
              variant === 'destructive-tertiary' || variant === 'destructive-secondary',
            'text-neutral-700':
              variant === 'neutral-tertiary' ||
              variant === 'neutral-secondary' ||
              variant === 'neutral-primary',
            'text-brand-700': variant === 'brand-tertiary' || variant === 'brand-secondary',
          },
        )}
      />
      {children}
    </div>
  );
};

export default Loading;
