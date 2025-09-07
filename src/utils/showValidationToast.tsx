import { toast } from "sonner";

export function showValidationToast(errors: string[]) {
  toast.error("Validation failed", {
    duration: 2000,
    description: (
      <div className="space-y-2">
        <ul className="list-disc pl-5 text-sm">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </div>
    ),
  });
}
