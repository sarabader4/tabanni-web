import { useState, useEffect } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  CountryPhoneDropdown,
  ALL_COUNTRIES,
  DEFAULT_COUNTRY,
  findCountryByCode,
  type CountryOption,
} from "@/components/country-phone-dropdown";

interface WhatsAppPhoneInputProps {
  onChange: (url: string) => void;
  initialPhone?: string;
  error?: string;
  touched?: boolean;
}

function parseInitialPhone(initialPhone?: string): {
  country: CountryOption;
  number: string;
} {
  if (!initialPhone) return { country: DEFAULT_COUNTRY, number: "" };

  if (initialPhone.startsWith("+")) {
    const parsed = parsePhoneNumberFromString(initialPhone);
    if (parsed?.country) {
      const country = findCountryByCode(parsed.country) ?? DEFAULT_COUNTRY;
      return { country, number: parsed.nationalNumber as string };
    }
  }

  const digitsOnly = initialPhone.replace(/\D/g, "");
  if (digitsOnly.length >= 7) {
    return { country: DEFAULT_COUNTRY, number: digitsOnly };
  }

  return { country: DEFAULT_COUNTRY, number: "" };
}

function buildWaUrl(dialCode: string, phoneValue: string): string {
  const dialDigits = dialCode.replace(/\D/g, "");
  const phoneDigits = phoneValue.replace(/\D/g, "");
  if (phoneDigits.length >= 7 && phoneDigits.length <= 15) {
    return `https://wa.me/${dialDigits}${phoneDigits}`;
  }
  return "";
}

export default function WhatsAppPhoneInput({
  onChange,
  initialPhone,
  error,
  touched,
}: WhatsAppPhoneInputProps) {
  const parsed = parseInitialPhone(initialPhone);

  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    parsed.country
  );
  const [phoneValue, setPhoneValue] = useState<string>(parsed.number);

  useEffect(() => {
    if (!initialPhone) return;
    const reparsed = parseInitialPhone(initialPhone);
    setSelectedCountry(reparsed.country);
    setPhoneValue(reparsed.number);
  }, [initialPhone]);

  useEffect(() => {
    const url = buildWaUrl(selectedCountry.dialCode, phoneValue);
    onChange(url);
  }, [selectedCountry, phoneValue]);

  const phoneDigits = phoneValue.replace(/\D/g, "");
  const tooShort = touched && phoneDigits.length > 0 && phoneDigits.length < 7;
  const tooLong = touched && phoneDigits.length > 15;
  const empty = touched && phoneDigits.length === 0;

  const internalError =
    error ||
    (empty
      ? "Phone number is required"
      : tooShort
      ? "Invalid phone number"
      : tooLong
      ? "Phone number is too long"
      : undefined);

  return (
    <div>
      <CountryPhoneDropdown
        selectedCountry={selectedCountry}
        onCountryChange={(c) => {
          setSelectedCountry(c);
        }}
        phoneValue={phoneValue}
        onPhoneChange={setPhoneValue}
        error={internalError}
        touched={touched}
        label="WhatsApp Number"
        instanceId="whatsapp"
      />
      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
        <span className="text-green-500">●</span>
        Please enter a phone number registered on WhatsApp.
      </p>
    </div>
  );
}
