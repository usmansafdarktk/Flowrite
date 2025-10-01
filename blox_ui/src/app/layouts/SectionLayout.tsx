import React from 'react';

const SectionLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="w-full">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-8 py-14 md:py-20 px-4 overfllow-hidden">
        {children}
      </div>
    </section>
  );
};

export default SectionLayout;
