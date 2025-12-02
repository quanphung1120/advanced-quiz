import {
  Collection,
  GetCollectionsResponse,
  GetCollectionResponse,
} from "@/types/collection";
import { auth } from "@clerk/nextjs/server";

export async function getCollections(): Promise<Collection[]> {
  console.log("[FRONTEND] getCollections called");
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    console.error("[FRONTEND] No auth token available");
    return [];
  }

  console.log("[FRONTEND] Getting token...");
  const token = await getToken();
  console.log("[FRONTEND] Token retrieved, length:", token?.length || 0);

  if (!token) {
    console.error("[FRONTEND] Failed to retrieve auth token");
    return [];
  }

  try {
    console.log("[FRONTEND] Making API request to collections");
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
    console.log("[FRONTEND] API response status:", response.status);
    if (!response.ok) {
      console.error("[FRONTEND] API request failed:", await response.text());
      return [];
    }
    const data: GetCollectionsResponse = await response.json();
    console.log("[FRONTEND] API response data:", data);
    return data.collections || [];
  } catch (error) {
    console.error("[FRONTEND] Failed to fetch collections:", error);
    return [];
  }
}

export async function getCollection(id: string): Promise<Collection | null> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    console.error("No auth token available for getCollection");
    return null;
  }

  const token = await getToken();

  if (!token) {
    console.error("Failed to retrieve auth token for getCollection");
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
      console.error("API request failed:", await response.text());
      return null;
    }

    const data: GetCollectionResponse = await response.json();
    return data.collection || null;
  } catch (error) {
    console.error("Failed to fetch collection:", error);
    return null;
  }
}
