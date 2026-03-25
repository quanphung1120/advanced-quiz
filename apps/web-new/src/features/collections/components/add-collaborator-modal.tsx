import { useDeferredValue, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Loader2,
  Mail,
  Search,
  Shield,
  UserPen,
  UserRound,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@advanced-quiz/ui/components/alert";
import { Button } from "@advanced-quiz/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@advanced-quiz/ui/components/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@advanced-quiz/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@advanced-quiz/ui/components/input-group";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@advanced-quiz/ui/components/toggle-group";
import { useAddCollaborator, useSearchUsers } from "../hooks/use-collections";

type AddCollaboratorModalProps = {
  collectionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ROLE_OPTIONS = [
  {
    value: "viewer" as const,
    label: "Viewer",
    description: "Can inspect the deck and study it.",
    icon: UserRound,
  },
  {
    value: "editor" as const,
    label: "Editor",
    description: "Can create, update, and delete flashcards.",
    icon: UserPen,
  },
  {
    value: "admin" as const,
    label: "Admin",
    description: "Can also manage collaborators.",
    icon: Shield,
  },
];

const addCollaboratorSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  role: z.enum(["viewer", "editor", "admin"]),
});

type AddCollaboratorFormValues = z.infer<typeof addCollaboratorSchema>;

function getDefaultValues(): AddCollaboratorFormValues {
  return {
    email: "",
    role: "viewer",
  };
}

function getMutationErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      "Failed to add collaborator. Verify access trace."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to add collaborator. Verify access trace.";
}

export function AddCollaboratorModal({
  collectionId,
  open,
  onOpenChange,
}: AddCollaboratorModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddCollaboratorFormValues>({
    resolver: zodResolver(addCollaboratorSchema),
    defaultValues: getDefaultValues(),
  });
  const email = useWatch({
    control,
    name: "email",
    defaultValue: "",
  });
  const role = useWatch({
    control,
    name: "role",
    defaultValue: "viewer",
  });
  const deferredEmail = useDeferredValue(email.trim());
  const suggestionsQuery = useSearchUsers(deferredEmail);
  const addCollaborator = useAddCollaborator(collectionId);

  useEffect(() => {
    if (!open) {
      reset(getDefaultValues());
      addCollaborator.reset();
    }
  }, [addCollaborator, open, reset]);

  const resetFormState = () => {
    reset(getDefaultValues());
    addCollaborator.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetFormState();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 sm:max-w-lg">
        <form
          className="flex flex-col"
          onSubmit={handleSubmit(async (values) => {
            await addCollaborator.mutateAsync({
              email: values.email,
              role: values.role,
            });
            resetFormState();
            onOpenChange(false);
          })}
        >
          <div className="flex flex-col gap-6 p-6 sm:p-8">
            <DialogHeader className="pr-8">
              <DialogTitle className="font-display text-2xl font-bold tracking-tight">
                Invite Collaborator
              </DialogTitle>
              <DialogDescription className="max-w-xl text-sm leading-6">
                Connect this knowledge base with other workspace members. Define
                their operational control below.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field data-invalid={errors.email ? true : undefined}>
                <FieldLabel
                  htmlFor="collaborator-email"
                  className="text-[10px] uppercase tracking-[0.2em]"
                >
                  Email Identity
                </FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupAddon>
                      <Mail />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="collaborator-email"
                      type="email"
                      placeholder="teammate@example.com"
                      aria-invalid={errors.email ? true : undefined}
                      className="font-medium"
                      {...register("email")}
                    />
                  </InputGroup>
                  <FieldError
                    errors={errors.email ? [errors.email] : undefined}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className="overflow-hidden rounded-xl border border-border bg-muted/20 p-5">
              <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                <Search className="h-3.5 w-3.5" />
                Suggested Matches
              </div>
              <div className="mt-4 flex min-h-[40px] flex-col gap-2">
                {suggestionsQuery.isLoading ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground animate-pulse">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Searching workspace...
                  </div>
                ) : suggestionsQuery.data?.length ? (
                  suggestionsQuery.data.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        setValue("email", suggestion, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                      }
                      className="group flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-left text-xs font-semibold transition-all hover:border-primary/30 hover:bg-primary/5"
                    >
                      <span>{suggestion}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Assign
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                    Type an email address to filter members. Results appear as
                    you type.
                  </p>
                )}
              </div>
            </div>

            <FieldGroup>
              <Field data-invalid={errors.role ? true : undefined}>
                <FieldLabel className="ml-1 text-[10px] tracking-[0.2em]">
                  Operational Role
                </FieldLabel>
                <FieldContent>
                  <Controller
                    control={control}
                    name="role"
                    render={({ field }) => (
                      <ToggleGroup
                        value={[field.value]}
                        onValueChange={(value) => {
                          if (value[0]) {
                            field.onChange(value[0]);
                          }
                        }}
                        orientation="vertical"
                        className="w-full"
                      >
                        {ROLE_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          const isActive = role === option.value;

                          return (
                            <ToggleGroupItem
                              key={option.value}
                              value={option.value}
                              variant="outline"
                              className="h-auto w-full justify-start rounded-xl border border-border bg-card/60 px-4 py-4 text-left hover:border-primary/30 hover:bg-card data-[pressed]:border-primary/60 data-[pressed]:bg-primary/10"
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  className={[
                                    "flex size-10 shrink-0 items-center justify-center rounded-lg border transition-all",
                                    isActive
                                      ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_oklch(0.52_0.26_258_/_0.4)]"
                                      : "border-border bg-muted/80 text-muted-foreground",
                                  ].join(" ")}
                                >
                                  <Icon className="h-4.5 w-4.5" />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <p className="text-sm font-bold tracking-tight text-foreground">
                                    {option.label}
                                  </p>
                                  <p className="text-xs font-medium leading-5 text-muted-foreground/80">
                                    {option.description}
                                  </p>
                                </div>
                              </div>
                            </ToggleGroupItem>
                          );
                        })}
                      </ToggleGroup>
                    )}
                  />
                  <FieldError errors={errors.role ? [errors.role] : undefined} />
                </FieldContent>
              </Field>
            </FieldGroup>

            {addCollaborator.error ? (
              <Alert
                variant="destructive"
                className="animate-in slide-in-from-top-1 fade-in"
              >
                <AlertTitle>Invitation failed</AlertTitle>
                <AlertDescription>
                  {getMutationErrorMessage(addCollaborator.error)}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

          <DialogFooter className="border-t border-border/60 px-6 py-4 sm:px-8">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                handleOpenChange(false);
              }}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addCollaborator.isPending || isSubmitting}
              className="px-8 shadow-[0_8px_24px_oklch(0.52_0.26_258_/_0.2)]"
            >
              {addCollaborator.isPending ? "Inviting..." : "Grant Access"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
