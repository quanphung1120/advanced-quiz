"use server";

import { revalidatePath } from "next/cache";
import { fetchWithAuth } from "@/lib/api";
import type {
  CreateCollectionRequest,
  CreateCollectionResponse,
  UpdateCollectionRequest,
  UpdateCollectionResponse,
  DeleteCollectionResponse,
  AddCollaboratorRequest,
  AddCollaboratorResponse,
  RemoveCollaboratorResponse,
} from "@/types/collection";
import { auth } from "@clerk/nextjs/server";

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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/collections/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    const result: CreateCollectionResponse = await response.json();
    if (result.errorMessage) {
      return { success: false, error: result.errorMessage };
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
  try {
    await fetchWithAuth<UpdateCollectionResponse>(`/api/v1/collections/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
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
  try {
    await fetchWithAuth<DeleteCollectionResponse>(`/api/v1/collections/${id}`, {
      method: "DELETE",
    });
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
  try {
    const response = await fetchWithAuth<AddCollaboratorResponse>(
      `/api/v1/collections/${collectionId}/collaborators`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (response.errorMessage) {
      return { success: false, error: response.errorMessage };
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
  try {
    const response = await fetchWithAuth<RemoveCollaboratorResponse>(
      `/api/v1/collections/${collectionId}/collaborators/${collaboratorId}`,
      {
        method: "DELETE",
      }
    );

    if (response.errorMessage) {
      return { success: false, error: response.errorMessage };
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
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/search-email-addresses?query=${encodeURIComponent(query)}`,
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

    const data: { emails: string[] } = await response.json();
    return { emails: data.emails || [] };
  } catch (error) {
    return {
      emails: [],
      error: error instanceof Error ? error.message : "Failed to search users",
    };
  }
}
