
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertCircle } from "lucide-react";

interface ValidationAlertProps {
  errors: string[];
  isVisible: boolean;
  onClose: () => void;
}

export function ValidationAlert({ errors, isVisible, onClose }: ValidationAlertProps) {
  if (!isVisible || errors.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <Alert variant="destructive" className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <AlertTitle className="text-red-800 font-semibold">
                Validation Failed
              </AlertTitle>
              <AlertDescription className="text-red-700 mt-2">
                Please fix the following errors before saving:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-red-600 hover:text-red-800 hover:bg-red-100 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      </div>
    </div>
  );
}
