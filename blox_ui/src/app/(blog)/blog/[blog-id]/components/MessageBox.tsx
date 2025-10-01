import { Message as MessageInterface } from '@/src/types/chat';

interface MessageBoxInteface extends MessageInterface {
  failed?: boolean;
}

const MessageBox = ({ message, type, time, failed }: MessageBoxInteface) => {
  return (
    <>
      <div className={`w-full flex ${type === 'sent' ? 'justify-end' : 'justify-start'}`}>
        <div className="flex flex-col items-start justify-center gap-1">
          <div
            className={`w-full flex flex-wrap items-center ${type === 'sent' ? 'justify-end' : 'justify-start'} gap-2`}
          >
            <span className="text-body-bold font-body-bold text-default-font">
              {type === 'sent' ? 'You' : 'AI'}
            </span>
            {time ? (
              <span className="text-caption font-caption text-subtext-color">{time}</span>
            ) : null}
          </div>
          <div
            className={`flex w-full max-w-[576px] flex-col items-start gap-2 rounded-md ${type === 'sent' ? 'bg-brand-600' : 'bg-neutral-100'} px-3 py-2`}
          >
            {message ? (
              <span
                className={`text-body font-body ${type === 'sent' ? 'text-black' : 'text-default-font'}`}
              >
                {message}
              </span>
            ) : null}
          </div>
          {failed && (
            <span className="text-caption font-body-bold text-warning-600 text-right">Failed.</span>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageBox;
