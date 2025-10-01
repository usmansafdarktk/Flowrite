'use client';

import CentreWindow from './components/CentreWindow';
import WindowDrawer from './components/WindowDrawer';
import RightWindow from './components/RightWindow';

function Page() {
  return (
    <>
      <div className="h-[calc(100vh-57px)] overflow-y-auto py-5 flex-1">
        <CentreWindow />
      </div>
      <WindowDrawer width={18} icon="FeatherSidebar" side="right">
        <RightWindow />
      </WindowDrawer>
    </>
  );
}

export default Page;
