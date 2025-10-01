'use client';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import FeedbackSuggestionModal from '@/components/ui/FeedbackSuggestionModal';

const FeedbackSection = () => {
  const [feedbackModal, setFeedbackModal] = useState(false);
  return (
    <>
      {feedbackModal && <FeedbackSuggestionModal setShowModal={setFeedbackModal} />}

      <div className="flex w-full flex-col items-center justify-center gap-8 border-t border-solid border-neutral-border bg-neutral-50 px-6 py-24">
        <div className="flex w-full max-w-[768px] flex-col items-center gap-6">
          <span className="text-heading-1 font-heading-1 text-default-font text-center">
            Share Your Experience
          </span>
          <span className="text-heading-3 font-body text-subtext-color text-center">
            We value your feedback to make BloX even better
          </span>
          <div className="flex w-full flex-col items-start gap-4">
            <TextArea className="h-auto w-full flex-none" variant="filled" helpText="">
              <TextArea.Input
                placeholder="Tell us about your experience with BloX..."
                value=""
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setFeedbackModal(true);
                }}
              />
            </TextArea>
            <Button onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>
              Submit Feedback
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackSection;
