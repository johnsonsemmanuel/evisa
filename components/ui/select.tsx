"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
  searchText?: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  searchable?: boolean;
  className?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  hint,
  required,
  searchable = false,
  className = "",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (searchable) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (option.searchText && option.searchText.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchQuery, options, searchable]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 text-left bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent ${
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-border hover:border-border-dark"
          }`}
        >
          <span className={selectedOption ? "text-text-primary" : "text-text-muted"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-border">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent/20 focus:border-accent"
                />
              </div>
            )}
            
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-text-muted">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-surface transition-colors flex items-center justify-between ${
                      value === option.value ? "bg-accent/5 text-accent" : "text-text-primary"
                    }`}
                  >
                    <span>{option.label}</span>
                    {value === option.value && (
                      <Check size={16} className="text-accent" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
      
      {hint && !error && (
        <p className="mt-1 text-sm text-text-muted">{hint}</p>
      )}
    </div>
  );
}