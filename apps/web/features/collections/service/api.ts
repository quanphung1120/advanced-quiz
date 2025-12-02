import {
  Collection,
  GetCollectionsResponse,
  GetCollectionResponse,
} from "@/types/collection";
import { auth } from "@clerk/nextjs/server";

export async function getCollections(): Promise<Collection[]> {
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
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/collections/`,
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

    const data: GetCollectionsResponse = await response.json();
    return data.collections || [];
  } catch {
    return [];
  }
}

export async function getCollection(id: string): Promise<Collection | null> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return null;
  }

  const token = await getToken();

  if (!token) {
    return null;
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
      return null;
    }

    const data: GetCollectionResponse = await response.json();
    return data.collection || null;
  } catch {
    return null;
  }
}
