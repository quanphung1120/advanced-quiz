"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// ============================================================
// Zod Schemas
// ============================================================

const CollectionCollaboratorSchema = z.object({
  id: z.string(),
  collection_id: z.string(),
  user_id: z.string(),
  email: z.string().optional(),
  role: z.enum(["viewer", "editor", "admin"]),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

const CreateCollectionResponseSchema = z.object({
  message: z.string().optional(),
  errorMessage: z.string().optional(),
});

const UpdateCollectionResponseSchema = z.object({
  message: z.string().optional(),
  errorMessage: z.string().optional(),
});

const DeleteCollectionResponseSchema = z.object({
  message: z.string().optional(),
  errorMessage: z.string().optional(),
});

const AddCollaboratorResponseSchema = z.object({
  collaborator: CollectionCollaboratorSchema.optional(),
  errorMessage: z.string().optional(),
});

const RemoveCollaboratorResponseSchema = z.object({
  message: z.string().optional(),
  errorMessage: z.string().optional(),
});

const SearchUsersResponseSchema = z.object({
  emails: z.array(z.string()).nullable(),
});

// ============================================================
// Types
// ============================================================

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  is_public: boolean;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  is_public?: boolean;
}

export interface AddCollaboratorRequest {
  email: string;
  role?: "viewer" | "editor" | "admin";
}

// ============================================================
// API Configuration
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ============================================================
// Server Actions
// ============================================================

export async function createCollection(
  data: CreateCollectionRequest
): Promise<{ success: boolean; error?: string }> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return {
      success: false,
      error: "User is not authenticated",
    };
  }

  const token = await getToken();
  if (!token) {
    return {
      success: false,
      error: "Failed to retrieve auth token",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    const parsed = CreateCollectionResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse createCollection response:", parsed.error);
      return { success: false, error: "Invalid response from server" };
    }

    if (parsed.data.errorMessage) {
      return { success: false, error: parsed.data.errorMessage };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create collection",
    };
  }
}

export async function updateCollection(
  id: string,
  data: UpdateCollectionRequest
): Promise<{ success: boolean; error?: string }> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return { success: false, error: "User is not authenticated" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    const parsed = UpdateCollectionResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse updateCollection response:", parsed.error);
      return { success: false, error: "Invalid response from server" };
    }

    if (parsed.data.errorMessage) {
      return { success: false, error: parsed.data.errorMessage };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/collections/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update collection",
    };
  }
}

export async function deleteCollection(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return { success: false, error: "User is not authenticated" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();
    const parsed = DeleteCollectionResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse deleteCollection response:", parsed.error);
      return { success: false, error: "Invalid response from server" };
    }

    if (parsed.data.errorMessage) {
      return { success: false, error: parsed.data.errorMessage };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete collection",
    };
  }
}

export async function addCollaborator(
  collectionId: string,
  data: AddCollaboratorRequest
): Promise<{ success: boolean; error?: string }> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return { success: false, error: "User is not authenticated" };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/collections/${collectionId}/collaborators`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    const json = await response.json();
    const parsed = AddCollaboratorResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse addCollaborator response:", parsed.error);
      return { success: false, error: "Invalid response from server" };
    }

    if (parsed.data.errorMessage) {
      return { success: false, error: parsed.data.errorMessage };
    }

    revalidatePath(`/dashboard/collections/${collectionId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add collaborator",
    };
  }
}

export async function removeCollaborator(
  collectionId: string,
  collaboratorId: string
): Promise<{ success: boolean; error?: string }> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return { success: false, error: "User is not authenticated" };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/collections/${collectionId}/collaborators/${collaboratorId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const json = await response.json();
    const parsed = RemoveCollaboratorResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error(
        "Failed to parse removeCollaborator response:",
        parsed.error
      );
      return { success: false, error: "Invalid response from server" };
    }

    if (parsed.data.errorMessage) {
      return { success: false, error: parsed.data.errorMessage };
    }

    revalidatePath(`/dashboard/collections/${collectionId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove collaborator",
    };
  }
}

export async function searchUsers(
  query: string
): Promise<{ emails: string[]; error?: string }> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return { emails: [], error: "User is not authenticated" };
  }

  const token = await getToken();
  if (!token) {
    return { emails: [], error: "Failed to retrieve auth token" };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/users/search-email-addresses?query=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return { emails: [], error: "Failed to search users" };
    }

    const json = await response.json();
    const parsed = SearchUsersResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse searchUsers response:", parsed.error);
      return { emails: [], error: "Invalid response from server" };
    }

    return { emails: parsed.data.emails || [] };
  } catch (error) {
    return {
      emails: [],
      error: error instanceof Error ? error.message : "Failed to search users",
    };
  }
}
