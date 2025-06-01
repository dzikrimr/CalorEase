import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  placeholder?: string;
  name: string;
  className?: string;
  disabled?: boolean;
  direction?: 'up' | 'down';
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Pilih opsi", 
  name,
  className = "",
  disabled = false,
  direction = 'down'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`w-full p-4 border-2 rounded-2xl text-base transition-all duration-300 outline-none ${
          disabled 
            ? 'border-[var(--primary-200)] bg-[var(--primary-50)] text-[var(--primary-600)] cursor-not-allowed'
            : isOpen
              ? 'border-[var(--primary-500)] bg-white shadow-[0_0_0_4px_rgba(31,169,141,0.1)]'
              : 'border-[var(--primary-200)] bg-[var(--primary-50)] text-[var(--primary-600)] hover:border-[var(--primary-500)] hover:bg-white hover:shadow-[0_0_0_4px_rgba(31,169,141,0.1)]'
        } flex justify-between items-center text-left`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${name}-label`}
      >
        <span className={selectedOption ? 'text-[var(--primary-600)]' : 'text-[var(--primary-600)] opacity-60'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-5 h-5 transition-transform duration-200 ${
            disabled ? 'text-[var(--primary-600)] opacity-60' : 'text-[var(--primary-600)]'
          } ${isOpen && direction === 'up' ? 'rotate-0' : isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && !disabled && (
        <div className={`absolute z-50 w-full bg-white border border-[var(--primary-500)] rounded-lg shadow-lg max-h-60 overflow-auto ${
          direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}>
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-4 py-3 text-left hover:bg-[#D2EEE8] transition-colors ${
                index === 0 ? 'rounded-t-lg' : ''
              } ${
                index === options.length - 1 ? 'rounded-b-lg' : ''
              } ${
                value === option.value 
                  ? 'bg-[var(--primary-500)] text-white font-medium hover:bg-[var(--primary-500)]' 
                  : 'text-[var(--primary-600)]'
              }`}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;