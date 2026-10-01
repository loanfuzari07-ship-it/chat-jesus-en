import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, Mic } from 'lucide-react';

interface ChatInputProps {
  placeholder?: string;
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  placeholder = "✏️ Type your name...",
  onSubmit,
  disabled = false
}) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  };

  const hasText = value.trim().length > 0;

  return (
    <div
      className="w-full px-2 py-1.5 bg-[#efeae2] border-t border-neutral-300/40 shrink-0 z-30"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 max-w-[560px] mx-auto">
        {/* Input pill */}
        <div className="flex-1 bg-white rounded-[24px] flex items-center px-3 py-1 shadow-[0_1px_1px_rgba(0,0,0,0.1)] border border-neutral-200 focus-within:border-[#075E54] transition-colors">
          <button
            type="button"
            className="text-[#8696a0] hover:text-[#54656f] p-1 rounded-full transition-colors shrink-0"
            aria-label="Emoji picker"
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent px-2 py-2 text-[15px] text-[#111b21] placeholder-[#8696a0] outline-none min-w-0"
          />

          <button
            type="button"
            className="text-[#8696a0] hover:text-[#54656f] p-1 rounded-full transition-colors shrink-0"
            aria-label="Attach"
          >
            <Paperclip className="w-5 h-5 -rotate-45" />
          </button>
        </div>

        {/* Action Button (Mic if empty, Send if has text) */}
        <button
          type={hasText ? 'submit' : 'button'}
          disabled={disabled}
          onClick={!hasText ? () => inputRef.current?.focus() : undefined}
          aria-label={hasText ? 'Send message' : 'Record audio'}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 bg-[#075E54] hover:bg-[#064e46] active:scale-95 transition-all shadow-md cursor-pointer"
        >
          {hasText ? (
            <Send className="w-5 h-5 ml-0.5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};
