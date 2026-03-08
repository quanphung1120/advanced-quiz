import { Monitor, Moon, Sun } from "lucide-react";
import type { ThemeMode } from "@/lib/theme-context";
import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

const modes = [
  { value: "light" as ThemeMode, icon: Sun, label: "Light" },
  { value: "system" as ThemeMode, icon: Monitor, label: "System" },
  { value: "dark" as ThemeMode, icon: Moon, label: "Dark" },
] as const;

interface ThemeToggleProps {
  /** Display a text label beside each icon (default: false) */
  showLabels?: boolean;
  className?: string;
}

export function ThemeToggle({
  showLabels = false,
  className,
}: ThemeToggleProps) {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme preference"
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5",
        className,
      )}
    >
      {modes.map(({ value, icon: Icon, label }) => {
        const isActive = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={`${label} theme`}
            aria-pressed={isActive}
            onClick={() => setMode(value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {showLabels && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
