"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, Mail, UserPlus, Shield, Eye, Pencil } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import { debounce } from "es-toolkit";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { addCollaborator } from "../service/actions";
import {
  addCollaboratorSchema,
  type AddCollaboratorFormData,
} from "../schemas";

interface AddCollaboratorDialogProps {
  collectionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchEmailsResponse {
  emails: string[];
}

const roleIcons = {
  viewer: Eye,
  editor: Pencil,
  admin: Shield,
};

const roleDescriptions = {
  viewer: "Can view flashcards only",
  editor: "Can view and edit flashcards",
  admin: "Full access including managing collaborators",
};

const createFetcher = (getToken: () => Promise<string | null>) => {
  return async (url: string): Promise<SearchEmailsResponse> => {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Search failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  };
};

export function AddCollaboratorDialog({
  collectionId,
  open,
  onOpenChange,
}: AddCollaboratorDialogProps) {
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState<string | null>(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const inputContainerRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<AddCollaboratorFormData>({
    resolver: zodResolver(addCollaboratorSchema),
    defaultValues: {
      email: "",
      role: "viewer",
    },
  });

  const emailValue = form.watch("email")?.trim() ?? "";

  const fetcher = React.useMemo(() => createFetcher(getToken), [getToken]);

  const swrKey = React.useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return null;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/search-email-addresses?query=${encodeURIComponent(searchQuery)}`;
  }, [searchQuery]);

  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useSWR<SearchEmailsResponse>(swrKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    keepPreviousData: true,
    dedupingInterval: 2000,
    errorRetryCount: 0,
  });

  React.useEffect(() => {
    if (searchError) {
      console.error("Search error:", searchError);
    }
  }, [searchError]);

  const searchResults = searchData?.emails ?? [];

  const shouldShowSuggestions = searchOpen && emailValue.length >= 2;

  const debouncedSetSearchQuery = React.useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query.length >= 2 ? query : null);
      }, 300),
    []
  );

  React.useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedSetSearchQuery]);

  const resetDialog = React.useCallback(() => {
    onOpenChange(false);
    form.reset();
    setSearchQuery(null);
  }, [onOpenChange, form]);

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      form.setValue("email", value);
      debouncedSetSearchQuery(value);
      setSearchOpen(true);
    },
    [form, debouncedSetSearchQuery]
  );

  const handleInputFocus = React.useCallback(() => {
    setSearchOpen(true);
  }, []);

  const handleInteractOutside = React.useCallback((e: Event) => {
    if (
      inputContainerRef.current &&
      inputContainerRef.current.contains(e.target as Node)
    ) {
      e.preventDefault();
    }
  }, []);

  const handlePreventDefault = React.useCallback(
    (e: React.SyntheticEvent | Event) => {
      e.preventDefault();
    },
    []
  );

  const handleSelectEmail = React.useCallback(
    (value: string) => {
      form.setValue("email", value);
      setSearchOpen(false);
    },
    [form]
  );

  async function onSubmit(data: AddCollaboratorFormData) {
    setIsSubmitting(true);
    try {
      const result = await addCollaborator(collectionId, {
        email: data.email,
        role: data.role,
      });
      if (result.success) {
        resetDialog();
      } else {
        form.setError("root", {
          message: result.error || "Failed to add collaborator",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5" />
              Add Collaborator
            </DialogTitle>
            <DialogDescription>
              Invite someone to collaborate on this collection by entering their
              email address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                  <Popover
                    open={shouldShowSuggestions}
                    onOpenChange={setSearchOpen}
                  >
                    <PopoverAnchor asChild>
                      <div className="relative" ref={inputContainerRef}>
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          {...field}
                          id={field.name}
                          type="email"
                          aria-invalid={fieldState.invalid}
                          placeholder="colleague@example.com"
                          autoComplete="off"
                          className="pl-10"
                          onChange={handleInputChange}
                          onFocus={handleInputFocus}
                        />
                        {isSearching && (
                          <Loader2Icon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </PopoverAnchor>
                    <PopoverContent
                      className="w-(--radix-popover-trigger-width) p-0"
                      align="start"
                      onOpenAutoFocus={handlePreventDefault}
                      onCloseAutoFocus={handlePreventDefault}
                      onInteractOutside={handleInteractOutside}
                    >
                      <Command>
                        <CommandList>
                          <CommandGroup heading="Suggestions">
                            {isSearching && (
                              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                                <Loader2Icon className="size-4 animate-spin" />
                                Searching users...
                              </div>
                            )}

                            {!isSearching && searchResults.length === 0 && (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                No registered users found.
                              </div>
                            )}

                            {searchResults.map((email) => (
                              <CommandItem
                                key={email}
                                value={email}
                                onMouseDown={handlePreventDefault}
                                onSelect={handleSelectEmail}
                                className="cursor-pointer"
                              >
                                <Mail className="size-4 mr-2" />
                                {email}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FieldDescription>
                    Type at least two characters to search for registered users.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => {
                const RoleIcon =
                  roleIcons[field.value as keyof typeof roleIcons];
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Permission Level
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue placeholder="Select a role">
                          {field.value && (
                            <span className="flex items-center gap-2">
                              <RoleIcon className="size-4" />
                              <span className="capitalize">{field.value}</span>
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(["viewer", "editor", "admin"] as const).map(
                          (role) => {
                            const Icon = roleIcons[role];
                            return (
                              <SelectItem key={role} value={role}>
                                <div className="flex items-center gap-2">
                                  <Icon className="size-4" />
                                  <div>
                                    <div className="font-medium capitalize">
                                      {role}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {roleDescriptions[role]}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          }
                        )}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Choose what the collaborator can do with this collection.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
            />

            {form.formState.errors.root && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={resetDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
              Add Collaborator
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
