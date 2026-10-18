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
          className="divine-choice"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
