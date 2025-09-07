import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useProductivityForm, useCell } from "@/context/ProductivityFormContext";
import { useDebounce } from "@/hooks/useDebounce";

/** Whole-number fields stay integers (no decimals) */
const WHOLE_NUMBER_FIELDS = new Set(["grams_per_hour", "plants_per_hour"]);
const isWholeNumberField = (k: string) => WHOLE_NUMBER_FIELDS.has(k);

const DEFAULT_DECIMAL = "0.0";
const DEFAULT_INTEGER = "0";
const SEED_VALUES = new Set([DEFAULT_INTEGER, DEFAULT_DECIMAL]);

function formatWholeNumberField(fieldKey: string, value: any) {
  if (isWholeNumberField(fieldKey) && typeof value === "number" && !isNaN(value)) {
    return Math.round(value).toString();
  }
  if (isWholeNumberField(fieldKey) && typeof value === "string" && value.trim() !== "" && !isNaN(Number(value))) {
    return String(Math.round(Number(value)));
  }
  return value ?? "";
}

interface ControlledInputProps {
  rowId: string;
  fieldKey: string;
  fieldType: string; // "number" | "text" | etc.
  isReadOnly: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const ControlledInput: React.FC<ControlledInputProps> = ({
  rowId,
  fieldKey,
  fieldType,
  isReadOnly,
  placeholder,
  className,
  autoFocus = false,
}) => {
  const { getCellValue, setCellValue } = useProductivityForm();
  const storeValue = useCell(rowId, fieldKey, undefined) // ✅ reactive subscription
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldClearOnNextChange = useRef(false);

  // limit numeric input length
  const numericMaxLen = fieldKey === "wet_weight_grams" || fieldKey === "wet_weight" ? 7 : 6;

  // sanitize while allowing a single decimal point
  const sanitize = (raw: string): string => {
    let s = raw ?? "";
    if (fieldKey === "first4_of_bt") return s.slice(0, 4);
    if (fieldKey === "comment") return s.slice(0, 200);

    if (fieldType === "number") {
      if (isWholeNumberField(fieldKey)) {
        s = s.replace(/\D/g, "").slice(0, numericMaxLen);
      } else {
        s = s.replace(/[^\d.]/g, "");
        const firstDot = s.indexOf(".");
        if (firstDot !== -1) {
          s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
        }
        const digits = s.replace(".", "").slice(0, numericMaxLen);
        if (firstDot === -1) {
          s = digits;
        } else {
          const left = digits.slice(0, Math.min(firstDot, digits.length));
          const right = digits.slice(left.length);
          s = right.length > 0 ? `${left}.${right}` : `${left}.`;
        }
      }
    }
    return s;
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    switch (fieldKey) {
      case "first4_of_bt": return "Enter Last 4 of BT";
      case "total_time": return "Enter Labor Minutes";
      case "total_time_minutes": return "Enter Total Labor Mins";
      case "input_weight": return "Enter Start weight in grams";
      case "trim_weight": return "Enter trim weight";
      case "wet_weight":
      case "wet_weight_grams": return "Enter wet weight";
      case "output_weight": return "Enter Finished Trimmed Weight";
      case "comment": return "Add a comment...";
      case "total_plants": return "Number of plants";
      case "team_size": return "Team size";
      case "duration_hours": return "Duration in hours";
      case "date": return "Select date";
      default: return `Enter ${fieldKey.replace(/_/g, " ")}`;
    }
  };

  const emitCellChange = (r: string, k: string) => {
    window.dispatchEvent(new CustomEvent("pf:cellchange", { detail: { rowId: r, fieldKey: k } }));
  };

  const [localValue, setLocalValue] = useState<string>(String(storeValue ?? ""));
  const debouncedValue = useDebounce(localValue, 300);

  // seed default numeric on mount when editing starts
  useEffect(() => {
    if (!isReadOnly && fieldType === "number") {
      const current = String(getCellValue(rowId, fieldKey, "") ?? "");
      if (current.trim() === "") {
        const seed = isWholeNumberField(fieldKey) ? DEFAULT_INTEGER : DEFAULT_DECIMAL;
        const clean = sanitize(seed);
        setLocalValue(clean);
        setCellValue(rowId, fieldKey, clean);
        emitCellChange(rowId, fieldKey); // kick formulas immediately
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadOnly, fieldType, rowId, fieldKey]);

  // keep local in sync with reactive store changes (calc fields updating)
  useEffect(() => {
    const next = String(storeValue ?? "");
    if (next !== localValue) setLocalValue(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeValue]);

  // commit debounced text (numbers commit instantly in onChange)
  useEffect(() => {
    if (fieldType === "number") return;
    if (debouncedValue !== storeValue) {
      setCellValue(rowId, fieldKey, debouncedValue);
      emitCellChange(rowId, fieldKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue, storeValue, rowId, fieldKey, fieldType]);

 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value ?? "";
    if (fieldType === "number" && SEED_VALUES.has(localValue) && shouldClearOnNextChange.current) {
      raw = raw.replace(localValue, "");
      shouldClearOnNextChange.current = false;
    }
    const clean = sanitize(raw);
    setLocalValue(clean);

    // numbers: commit immediately for live calcs
    if (fieldType === "number") {
      setCellValue(rowId, fieldKey, clean);
      emitCellChange(rowId, fieldKey);
    }
  };

  const commitNow = () => {
    let clean = sanitize(localValue);
    if (fieldType === "number" && (clean === "" || clean === ".")) {
      clean = isWholeNumberField(fieldKey) ? DEFAULT_INTEGER : DEFAULT_DECIMAL;
    }
    setLocalValue(clean);
    setCellValue(rowId, fieldKey, clean);
    emitCellChange(rowId, fieldKey);
  };

  const handleBlur = () => commitNow();

  let displayValue: string = localValue;
  if (fieldType === "number" && (displayValue === "" || displayValue === ".")) {
    displayValue = isWholeNumberField(fieldKey) ? DEFAULT_INTEGER : DEFAULT_DECIMAL;
  }
  // keep whole-number formatting rule (only when we actually have a number)
  if (fieldKey === "grams_per_hour" && displayValue !== "" && !isNaN(Number(displayValue))) {
    displayValue = formatWholeNumberField(fieldKey, Number(displayValue));
  }

  return (
    <Input
      ref={inputRef}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (fieldType === "number") {
          const blocked = ["e", "E", "+", "-"];
          if (blocked.includes(e.key)) e.preventDefault();
        }
        if (!isReadOnly && fieldType === "number" && SEED_VALUES.has(localValue)) {
          const isTypingKey = e.key.length === 1 || e.key === "Backspace" || e.key === "Delete";
          if (isTypingKey) shouldClearOnNextChange.current = true;
        }
        if (e.key === "Tab") commitNow(); // commit before leaving
      }}
      disabled={isReadOnly}
      placeholder={getPlaceholder()}
      className={cn(
        isReadOnly ? "bg-muted text-muted-foreground" : "",
        "transition-none h-8 text-xs",
        className
      )}
      inputMode={fieldType === "number" ? "numeric" : undefined}
      autoComplete="off"
      autoFocus={autoFocus}
    />
  );
};
