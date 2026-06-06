import { useState } from "react";

// Types
export interface ValidationResult {
  isValid: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumbers: boolean;
  hasSpecialChar: boolean;
  isValidLength: boolean;
  strength: PasswordStrength;
}

export interface PasswordStrength {
  level: "weak" | "medium" | "strong";
  text: string;
  color: string;
  bg: string;
}

export interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  id?: string;
  placeholder?: string;
  className?: string;
  showValidation?: boolean; // Add this prop to control validation visibility
}

// Calculate password strength
const getPasswordStrength = (password: string): PasswordStrength => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  if (strength <= 2) {
    return {
      level: "weak",
      text: "Weak",
      color: "text-red-500",
      bg: "bg-red-100",
    };
  }
  if (strength <= 4) {
    return {
      level: "medium",
      text: "Medium",
      color: "text-yellow-500",
      bg: "bg-yellow-100",
    };
  }
  return {
    level: "strong",
    text: "Strong",
    color: "text-green-500",
    bg: "bg-green-100",
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isValidLength = password.length >= 8;

  return {
    isValid: hasUpperCase && hasLowerCase && isValidLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    isValidLength,
    strength: getPasswordStrength(password),
  };
};

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  required = false,
  id = "password",
  placeholder = "••••••••",
  className = "",
  showValidation = false // Default to false - no validation visible
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const newPassword = e.target.value;
    onChange(e);
    // Only validate if showValidation is true
    if (showValidation) {
      setValidation(validatePassword(newPassword));
    } else {
      setValidation(null);
    }
  };

  // Reset validation when showValidation changes
  const shouldShowValidation = showValidation && value.length > 0 && validation;
  const shouldShowError = showValidation && validation?.isValid === false && value.length > 0 && isFocused;
  const shouldShowSuccess = showValidation && validation?.isValid && value.length > 0;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={handlePasswordChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          className={`
            h-12 w-full rounded-xl  
            border-2 
            px-4 
            pr-12 
            text-slate-700 
            placeholder:text-slate-400 
            transition-all 
            duration-200 
            ease-in-out
            outline-none
            focus:outline-none
            ${
              shouldShowError
                ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:bg-red-50/50 focus:ring-4 focus:ring-red-500/20"
                : shouldShowSuccess
                  ? "border-green-400 bg-green-50/30 focus:border-green-500 focus:bg-green-50/50 focus:ring-4 focus:ring-green-500/20"
                  : isFocused
                    ? "border-brand-500 bg-white shadow-lg shadow-brand-500/10 focus:ring-4 focus:ring-brand-500/20"
                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white"
            }
            ${className}
          `}
        />

        {/* Status Icon (Success/Error) */}
        {showValidation && value.length > 0 && validation && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            {validation.isValid ? (
              <svg className="h-4 w-4 text-green-500 animate-in fade-in zoom-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              isFocused && (
                <svg className="h-4 w-4 text-red-400 animate-in fade-in zoom-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )
            )}
          </div>
        )}

        {/* Show/Hide Password Toggle */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Password Strength Indicator - Only show when validation is enabled */}
      {showValidation && value && validation && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div
                className={`h-1.5 w-16 rounded-full transition-all ${
                  validation.strength.level === "weak"
                    ? "bg-red-500"
                    : validation.strength.level === "medium"
                      ? "bg-yellow-500"
                      : validation.strength.level === "strong"
                        ? "bg-green-500"
                        : "bg-slate-200"
                }`}
              />
              <div
                className={`h-1.5 w-16 rounded-full transition-all ${
                  validation.strength.level === "medium" ||
                  validation.strength.level === "strong"
                    ? validation.strength.level === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                    : "bg-slate-200"
                }`}
              />
              <div
                className={`h-1.5 w-16 rounded-full transition-all ${
                  validation.strength.level === "strong"
                    ? "bg-green-500"
                    : "bg-slate-200"
                }`}
              />
            </div>
            <span
              className={`text-xs font-medium ${validation.strength.color}`}
            >
              {validation.strength.text} Password
            </span>
          </div>

          {/* Validation Requirements - Only show when focused and validation enabled */}
          {isFocused && (
            <div className="space-y-1 text-xs animate-in fade-in duration-200">
              <p
                className={`flex items-center gap-1.5 ${validation.isValidLength ? "text-green-600" : "text-slate-500"}`}
              >
                <span className="text-sm">
                  {validation.isValidLength ? "✓" : "○"}
                </span>
                At least 8 characters
              </p>
              <p
                className={`flex items-center gap-1.5 ${validation.hasUpperCase ? "text-green-600" : "text-slate-500"}`}
              >
                <span className="text-sm">
                  {validation.hasUpperCase ? "✓" : "○"}
                </span>
                Uppercase letter (A-Z)
              </p>
              <p
                className={`flex items-center gap-1.5 ${validation.hasLowerCase ? "text-green-600" : "text-slate-500"}`}
              >
                <span className="text-sm">
                  {validation.hasLowerCase ? "✓" : "○"}
                </span>
                Lowercase letter (a-z)
              </p>
              <p
                className={`flex items-center gap-1.5 ${validation.hasNumbers ? "text-green-600" : "text-slate-500"}`}
              >
                <span className="text-sm">
                  {validation.hasNumbers ? "✓" : "○"}
                </span>
                Number (0-9)
              </p>
              <p
                className={`flex items-center gap-1.5 ${validation.hasSpecialChar ? "text-green-600" : "text-slate-500"}`}
              >
                <span className="text-sm">
                  {validation.hasSpecialChar ? "✓" : "○"}
                </span>
                Special character (!@#$%^&*)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Custom hook for password validation
export const usePasswordValidation = (initialValue: string = "", enableValidation: boolean = true) => {
  const [password, setPassword] = useState<string>(initialValue);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (enableValidation) {
      setValidation(validatePassword(newPassword));
    } else {
      setValidation(null);
    }
  };

  return {
    password,
    validation,
    isValid: enableValidation ? (validation?.isValid ?? false) : true,
    handlePasswordChange,
    setPassword,
  };
};

export default PasswordInput;