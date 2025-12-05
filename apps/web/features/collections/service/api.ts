import { cache } from "react";
import { Collection, GetCollectionResponse } from "@/types/collection";
import { auth } from "@clerk/nextjs/server";

interface GetMyCollectionsResponse {
  owned_collections: Collection[];
  shared_collections: Collection[];
  errorMessage: string;
}

export const getCollections = cache(async (): Promise<Collection[]> => {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return [];
  }

  const token = await getToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/collections/me`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        next: { tags: ["collections"] },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data: GetMyCollectionsResponse = await response.json();
    // Combine owned and shared collections
    return [
      ...(data.owned_collections || []),
      ...(data.shared_collections || []),
    ];
  } catch {
    return [];
  }
});

export async function getMyCollections(): Promise<{
  owned: Collection[];
  shared: Collection[];
}> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return { owned: [], shared: [] };
  }

  const token = await getToken();

  if (!token) {
    return { owned: [], shared: [] };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/collections/me`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        next: { tags: ["collections"] },
      }
    );

    if (!response.ok) {
      return { owned: [], shared: [] };
    }

    const data: GetMyCollectionsResponse = await response.json();
    return {
      owned: data.owned_collections || [],
      shared: data.shared_collections || [],
    };
  } catch {
    return { owned: [], shared: [] };
  }
}

export async function getCollection(id: string): Promise<{
  collection: Collection | null;
  role: "owner" | "editor" | "viewer" | null;
}> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return { collection: null, role: null };
  }

  const token = await getToken();

  if (!token) {
    return { collection: null, role: null };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/collections/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return { collection: null, role: null };
    }

    const data: GetCollectionResponse & {
      role?: "owner" | "editor" | "viewer";
    } = await response.json();
    return {
      collection: data.collection || null,
      role: data.role || null,
    };
  } catch {
    return { collection: null, role: null };
  }
}

export async function searchUsersByEmail(query: string): Promise<string[]> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return [];
  }

  const token = await getToken();

  if (!token) {
    return [];
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
      return [];
    }

    const data: { emails: string[] } = await response.json();
    return data.emails || [];
  } catch {
    return [];
  }
}
