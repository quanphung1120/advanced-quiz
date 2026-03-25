import { Spinner } from "@advanced-quiz/ui/components/spinner";
import { cn } from "@/utils/cn";

type LoadingStateProps = {
  label?: string;
  className?: string;
  spinnerClassName?: string;
};

export function LoadingState({
  label,
  className,
  spinnerClassName,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] w-full items-center justify-center",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Spinner className={cn("size-12 text-primary", spinnerClassName)} />
        {label ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            {label}
          </p>
        ) : null}
      </div>
    </div>
  );
}
