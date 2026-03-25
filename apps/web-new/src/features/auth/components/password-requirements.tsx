import { Check, X } from "lucide-react";
import { cn } from "@/utils/cn";

export function PasswordRequirements({ password }: { password?: string }) {
  const pwd = password || "";

  const rules = [
    { label: "At least 8 characters", met: pwd.length >= 8 },
    { label: "Maximum 64 characters", met: pwd.length > 0 && pwd.length <= 64 },
    { label: "One uppercase letter", met: /[A-Z]/.test(pwd) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(pwd) },
  ];

  return (
    <ul className="mt-2 space-y-1.5 text-xs font-medium">
      {rules.map((rule) => {
        const isMet = rule.met;
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5",
              isMet ? "text-emerald-500 dark:text-emerald-400" : "text-destructive"
            )}
          >
            {isMet ? (
              <Check className="h-3.5 w-3.5 flex-shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 flex-shrink-0" />
            )}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
