import React, { useRef } from "react";

export const OtpInput = ({
  value = "",
  onChange,
  length = 6,
  disabled = false,
  error = false,
  autoFocus = true,
}) => {
  const inputRefs = useRef([]);

  // Convert string value to array of characters
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const handleChange = (e, index) => {
    const val = e.target.value;
    // Allow only single numeric digit
    const lastChar = val.slice(-1);
    if (val && !/^\d$/.test(lastChar)) {
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = lastChar;
    const newValue = newDigits.join("");
    onChange(newValue);

    // If digit entered and not last input, focus next
    if (lastChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Current is empty, focus previous and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    const pasteDigits = pasteData.replace(/\D/g, "").slice(0, length);
    if (pasteDigits) {
      onChange(pasteDigits);
      const focusIndex = Math.min(pasteDigits.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => {
        const isFilled = !!digits[index];
        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={digits[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            autoFocus={autoFocus && index === 0}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-lg sm:text-xl font-bold font-mono rounded-md border bg-[#141E2D] text-[#E8EDF5] transition-all outline-none select-none ${
              error
                ? "border-status-error focus:ring-1 focus:ring-status-error focus:border-status-error"
                : isFilled
                ? "border-primary bg-primary/10 ring-1 ring-primary/40 text-primary"
                : "border-[#29374A] hover:border-[#3D4F68] focus:border-primary focus:ring-1 focus:ring-primary"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        );
      })}
    </div>
  );
};

export default OtpInput;
