import Hero from './components/Hero';
import FeedbackSection from './components/FeedbackSection';
import HowItWorks from './components/HowItWorks';

function LandingPage() {
  return (
    <div className="flex w-full flex-col items-center bg-black">
      <Hero />
      <HowItWorks />
      <FeedbackSection />
    </div>
  );
}

export default LandingPage;
