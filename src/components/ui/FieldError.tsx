import { cn } from "@/lib/utils";

/* System default field-validation style (Variation E — tooltip callout).
   Render inside a `relative` wrapper directly before the input; it floats a
   red bubble with a downward arrow above the field. Apply `ERROR_BORDER` to the
   input when errored. Use for ALL future form validation. */

export const ERROR_RED = "#e2504a";
export const ERROR_BORDER = "!border-[#e2504a]"; // add to an input's className when it has an error

export function FieldError({ message, className }: { message?: string | null; className?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        "field-error-tip pointer-events-none absolute -top-9 left-0 z-20 max-w-full rounded-lg px-2.5 py-1.5 text-xs font-medium text-white",
        className,
      )}
      style={{ background: ERROR_RED, boxShadow: "0 8px 20px -8px rgba(226,80,74,0.7)" }}
    >
      {message}
      <span
        className="absolute -bottom-1 left-4 size-2.5 rotate-45"
        style={{ background: ERROR_RED }}
      />
    </div>
  );
}
