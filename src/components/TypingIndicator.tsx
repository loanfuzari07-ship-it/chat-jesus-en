import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex w-full my-1 px-2.5 sm:px-3 justify-start animate-in fade-in duration-150">
      <div className="relative bg-white rounded-lg rounded-tl-none px-3.5 py-2.5 shadow-[0_1px_1px_rgba(0,0,0,0.12)] flex items-center gap-1.5">
        <div
          className="absolute top-0 -left-[6px] w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent"
          aria-hidden="true"
        />
        <span
          className="w-2 h-2 rounded-full bg-[#8696a0] animate-wa-bounce"
          style={{ animationDelay: '0s' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-[#8696a0] animate-wa-bounce"
          style={{ animationDelay: '0.2s' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-[#8696a0] animate-wa-bounce"
          style={{ animationDelay: '0.4s' }}
        />
      </div>
    </div>
  );
};
