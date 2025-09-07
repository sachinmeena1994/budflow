import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

export function DateInput({
  value,
  onChange,
  error,
  disabled = false,
  className,
  required = false,
}: DateInputProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="w-full">
      <Input
        type="date"
        value={value}
        onChange={handleDateChange}
        disabled={disabled}
        className={cn(
          "h-8 text-xs bg-white focus:border-blue-500 w-full border-gray-300",
          error ? "border-red-500" : "",
          className
        )}
        required={required}
      />
      {error && (
        <span className="text-red-500 text-xs mt-1 block">{error}</span>
      )}
    </div>
  )
}