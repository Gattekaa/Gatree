"use client";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function PhoneField({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: PhoneFieldProps) {
  return (
    <PhoneInput
      data-slot="input"
      aria-label={ariaLabel}
      international
      defaultCountry="BR"
      value={value}
      onChange={(val) => onChange(val || "")}
      placeholder={placeholder || "+55 11 99999-9999"}
      className="flex h-12 w-full gap-2 rounded-xl border border-hairline-strong bg-canvas px-3.5 text-[15px] text-ink transition-colors duration-150 focus-within:border-primary focus-within:bg-surface-1 [--PhoneInput-color--focus:var(--color-primary)] [&_.PhoneInputCountry]:gap-1 [&_.PhoneInputCountryIcon]:h-[15px] [&_.PhoneInputCountryIcon]:w-5 [&_.PhoneInputCountryIcon]:overflow-hidden [&_.PhoneInputCountryIcon]:rounded-[2px] [&_.PhoneInputCountryIcon]:border-0 [&_.PhoneInputCountryIcon]:bg-transparent [&_.PhoneInputCountryIcon]:shadow-none! [&_.PhoneInputCountrySelectArrow]:size-1.5 [&_.PhoneInputCountrySelectArrow]:border-ink-tertiary [&_.PhoneInputCountrySelectArrow]:opacity-70 [&_.PhoneInputCountrySelect]:outline-none! [&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-[15px] [&_.PhoneInputInput]:text-ink [&_.PhoneInputInput]:outline-none! [&_.PhoneInputInput]:ring-0 [&_.PhoneInputInput::placeholder]:text-ink-tertiary"
    />
  );
}
