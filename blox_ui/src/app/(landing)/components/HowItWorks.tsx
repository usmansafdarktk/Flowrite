import SectionLayout from '../../layouts/SectionLayout';

const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      title: 'Describe the blog you want to write.',
    },
    {
      number: '2',
      title: 'BloX drafts your first version instantly.',
    },
    {
      number: '3',
      title: 'Refine it by asking for edits or new ideas.',
    },
    {
      number: '4',
      title: 'Publish your blog or export it to your platform.',
    },
  ];

  return (
    <SectionLayout>
      <span className="text-heading-2 font-body text-subtext-color text-center">
        BloX is set to help bloggers create amazing content with ease.
      </span>
      <div>
        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative bg-neutral-50 px-4 py-8 border border-neutral-border rounded-lg">
          {/* Connecting Lines */}
          <div
            style={{
              borderImageSlice: 1,
              borderImageSource:
                'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.5) 0%, rgba(252,70,107,0) 130%)',
            }}
            className={`border-t absolute left-5 top-14 hidden w-[95%] h-full md:block`}
          ></div>

          {steps.map((step, index) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center group relative"
            >
              {/* Step Number */}
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 relative z-10">
                <span className="text-gray-300">{step.number}</span>
              </div>

              {/* Step Description */}
              <p className="text-body font-body text-subtext-color">{step.title}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionLayout>
  );
};

export default HowItWorks;
