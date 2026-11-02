import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

/**
 * CustomDropdown Component
 * Provides custom dropdown with full CSS control over hover and active state
 * matching the theme (#8931BA).
 *
 * Props:
 * - label: string (optional label to display inside button)
 * - value: string | number
 * - onChange: (value: string | number) => void
 * - options: Array<string | { value: string | number, label: string }>
 * - placeholder: string
 * - disabled: boolean
 * - required: boolean
 * - className: string (for the trigger button)
 * - containerClassName: string
 */
const CustomDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select Option",
  disabled = false,
  required = false,
  className = "",
  containerClassName = "w-full",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options to { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return { value: opt.value, label: opt.label ?? opt.name ?? String(opt.value) };
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${containerClassName}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-left flex items-center justify-between gap-2 transition-all cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
          isOpen
            ? "border-[#8931BA] ring-2 ring-[#8931BA]/20"
            : "hover:border-gray-300"
        } ${className}`}
      >
        <span
          className={`truncate ${
            selectedOption && selectedOption.value !== ""
              ? "text-gray-800 font-medium"
              : "text-gray-400"
          }`}
        >
          {label && <span className="text-gray-500 font-normal mr-1">{label}:</span>}
          {selectedOption && selectedOption.value !== ""
            ? selectedOption.label
            : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#8931BA]" : ""
          }`}
        />
      </button>

      {/* Hidden input for form required validations if needed */}
      {required && (
        <input
          type="text"
          value={value || ""}
          required
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
        />
      )}

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto scrollbar-hide">
          {placeholder && !normalizedOptions.some((opt) => opt.label.toLowerCase() === placeholder.toLowerCase()) && (
            <div
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className={`custom-dropdown-item px-3.5 py-2 text-xs cursor-pointer flex items-center justify-between ${
                !value ? "is-selected font-semibold" : ""
              }`}
            >
              <span>{placeholder}</span>
              {!value && <span className="w-1.5 h-1.5 rounded-full bg-[#8931BA]" />}
            </div>
          )}
          {normalizedOptions
            .filter((opt) => opt.value !== "")
            .map((opt) => {
              const isSelected = String(value) === String(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`custom-dropdown-item px-3.5 py-2 text-xs cursor-pointer flex items-center justify-between ${
                    isSelected ? "is-selected font-semibold" : ""
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8931BA] shrink-0" />
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
