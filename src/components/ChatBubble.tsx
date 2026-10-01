import React from 'react';
import { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isJesus = message.sender === 'jesus';

  // Helper to parse markdown bold text safely (**bold**)
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-[#111b21]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className={`flex w-full my-1 px-2.5 sm:px-3 ${
        isJesus ? 'justify-start' : 'justify-end'
      } animate-in fade-in duration-200`}
    >
      <div
        className={`relative max-w-[86%] sm:max-w-[78%] px-3 pt-1.5 pb-4 text-[14.2px] leading-[1.38] text-[#111b21] shadow-[0_1px_1px_rgba(0,0,0,0.12)] select-text ${
          isJesus
            ? 'bg-white rounded-lg rounded-tl-none'
            : 'bg-[#d9fdd3] rounded-lg rounded-tr-none'
        }`}
        style={{ wordBreak: 'break-word' }}
      >
        {/* Chat speech bubble tail */}
        {isJesus ? (
          <div
            className="absolute top-0 -left-[6px] w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent"
            aria-hidden="true"
          />
        ) : (
          <div
            className="absolute top-0 -right-[6px] w-0 h-0 border-t-[8px] border-t-[#d9fdd3] border-r-[8px] border-r-transparent"
            aria-hidden="true"
          />
        )}

        {/* Message content */}
        <div className="whitespace-pre-wrap">
          {renderFormattedText(message.text)}
        </div>

        {/* WhatsApp Timestamp & Blue Ticks */}
        <div className="absolute bottom-1 right-2 flex items-center gap-1 pointer-events-none select-none text-[11px] text-[#667781] leading-none">
          <span>{message.timestamp}</span>
          {!isJesus && (
            <svg
              width="15"
              height="10"
              viewBox="0 0 16 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block shrink-0"
            >
              <path
                d="M1 5.5L4 8.5L9 1.5"
                stroke="#53bdeb"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.5 8.5L10.5 1.5"
                stroke="#53bdeb"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M7 5.5L10 8.5L15 1.5"
                stroke="#53bdeb"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
