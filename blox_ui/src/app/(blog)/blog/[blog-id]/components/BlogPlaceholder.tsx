import * as SubframeCore from '@subframe/core';
import { FeatherPlay } from '@subframe/core';

const BlogPlaceholder = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <FeatherPlay className="text-heading-3 font-heading-3 text-subtext-color" />
      <div className="flex flex-col items-center justify-center gap-1">
        <span className="text-caption-bold font-caption-bold text-default-font">
          Begin Your Next Big Thing
        </span>
        <span className="text-caption font-caption text-subtext-color">
          Fill up the metadata on right sidebar to get your first draft
        </span>
        <span className="text-caption font-caption text-orange-300 flex items-center gap-1">
          <SubframeCore.IconWrapper className="text-orange-300">
            <SubframeCore.FeatherAlertTriangle />
          </SubframeCore.IconWrapper>
          <span>Metadata shapes all AI replies. Set it carefully — it can't be changed.</span>
        </span>
      </div>
    </div>
  );
};

export default BlogPlaceholder;
