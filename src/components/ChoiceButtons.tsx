import React from 'react';

export interface ChoiceOption {
  id: string;
  label: string;
  value?: string;
}

interface ChoiceButtonsProps {
  options: ChoiceOption[];
  onSelect: (option: ChoiceOption) => void;
  disabled?: boolean;
}

export const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({
  options,
  onSelect,
  disabled = false
}) => {
  return (
    <div className="w-full px-3 my-2.5 flex flex-col gap-2 items-center animate-in fade-in slide-in-from-bottom-2 duration-200">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          className="w-full max-w-[400px] min-h-[46px] px-4 py-2.5 rounded-[22px] bg-[#075E54] hover:bg-[#064e46] active:bg-[#053d37] text-white font-semibold text-[14.5px] leading-snug shadow-[0_1px_3px_rgba(0,0,0,0.2)] active:scale-[0.98] transition-all flex items-center justify-center text-center cursor-pointer disabled:opacity-50"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
