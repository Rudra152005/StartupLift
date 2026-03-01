import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // icon library (already available in shadcn/lucide-react setup)

export default function InputField({
  label,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
  required = false,
  error = "",
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false);

  // Determine input type dynamically
  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-[#6B7280] dark:text-[#94A3B8] mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-4 py-2 rounded-md bg-[#FFFFFF] dark:bg-[#1E293B] border ${
            error ? "border-red-500" : "border-[#D1D5DB] dark:border-[#475569]"
          } focus:border-[#3B82F6] outline-none text-[#1A1A1A] dark:text-[#F8FAFC] placeholder-[#6B7280] dark:placeholder-[#94A3B8] transition-colors duration-300 ${className}`}
        />

        {/* 👁️ Password Toggle Button */}
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-purple-400"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
