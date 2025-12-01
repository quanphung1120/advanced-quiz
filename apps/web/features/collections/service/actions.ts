"use server";

import { revalidatePath, updateTag } from "next/cache";
import { fetchWithAuth } from "@/lib/api";
import type {
  CreateCollectionRequest,
  CreateCollectionResponse,
  UpdateCollectionRequest,
  UpdateCollectionResponse,
  DeleteCollectionResponse,
} from "@/types/collection";

export async function createCollection(
  data: CreateCollectionRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/collections/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    console.error("Failed to create collection:", error);
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
    console.error("Failed to update collection:", error);
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
    console.error("Failed to delete collection:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete collection",
    };
  }
}
