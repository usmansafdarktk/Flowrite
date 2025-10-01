'use client';
import Link from 'next/link';
import { Button } from './Button';

const FeedbackSuggestionModal = ({
  setShowModal,
}: {
  setShowModal: (showModal: boolean) => void;
}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="p-8 border w-[480px] shadow-xl rounded-2xl bg-white transform transition-all">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl">👋</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Hey there, let's chat!</h3>
          <div className="mt-4 px-7 py-3">
            <p className="text-lg text-gray-600 leading-relaxed">
              Skip the formalities! Let's jump on a quick Google Chat call to discuss your thoughts.
            </p>
            <Link
              href="https://chat.google.com/chat/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Join Google Chat
            </Link>
          </div>
          <div className="flex justify-center mt-6">
            <Button
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                setShowModal(false);
              }}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Maybe later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSuggestionModal;
