import {
  Collection,
  GetCollectionsResponse,
  GetCollectionResponse,
} from "@/types/collection";
import { auth } from "@clerk/nextjs/server";

function maskToken(token?: string | null) {
  if (!token) return "[NO_TOKEN]";
  if (token.length <= 10) return token;
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

function getRequestId() {
  // Simple request id for correlating logs (not cryptographically secure)
  return Math.random().toString(36).slice(2, 9);
}

export async function getCollections(): Promise<Collection[]> {
  const rid = getRequestId();
  console.log(`[FRONTEND][${rid}] getCollections called`);
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    console.error(`[FRONTEND][${rid}] No auth token available`);
    return [];
  }

  console.log(`[FRONTEND][${rid}] Getting token...`);
  const token = await getToken();
  console.log(
    `[FRONTEND][${rid}] Token status: ${token ? "present" : "missing"}, masked: ${maskToken(token)}`
  );

  if (!token) {
    console.error("[FRONTEND] Failed to retrieve auth token");
    return [];
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/collections/`;
    console.log(`[FRONTEND][${rid}] Making API request to ${url}`);
    const start = Date.now();
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: { tags: ["collections"] },
    });
    const duration = Date.now() - start;
    console.log(
      `[FRONTEND][${rid}] API response status: ${response.status} (${duration}ms)`
    );
    let data: GetCollectionsResponse | null = null;
    try {
      data = await response.json();
    } catch (jsonErr) {
      console.error(
        `[FRONTEND][${rid}] Failed to parse response JSON:`,
        jsonErr
      );
    }
    console.log(`[FRONTEND][${rid}] API response data:`, data);
    return data?.collections || [];
  } catch (error) {
    console.error(`[FRONTEND][${rid}] Failed to fetch collections:`, error);
    return [];
  }
}

export async function getCollection(id: string): Promise<Collection | null> {
  const rid = getRequestId();
  console.log(`[FRONTEND][${rid}] getCollection called for id=${id}`);
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    console.error(
      `[FRONTEND][${rid}] No auth token available for getCollection`
    );
    return null;
  }

  const token = await getToken();

  console.log(
    `[FRONTEND][${rid}] Token status for getCollection: ${token ? "present" : "missing"}, masked: ${maskToken(token)}`
  );

  if (!token) {
    console.error(
      `[FRONTEND][${rid}] Failed to retrieve auth token for getCollection`
    );
    return null;
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/collections/${id}`;
    console.log(`[FRONTEND][${rid}] Fetching collection from ${url}`);
    const start = Date.now();
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const duration = Date.now() - start;
    console.log(
      `[FRONTEND][${rid}] Response status: ${response.status} (${duration}ms)`
    );
    if (!response.ok) {
      const text = await response.text();
      console.error(
        `[FRONTEND][${rid}] API request failed: ${response.status} / ${text}`
      );
      return null;
    }

    let data: GetCollectionResponse | null = null;
    try {
      data = await response.json();
    } catch (jsonErr) {
      console.error(
        `[FRONTEND][${rid}] Failed to parse response JSON for getCollection:`,
        jsonErr
      );
    }
    console.log(`[FRONTEND][${rid}] Response body:`, data);
    return data?.collection || null;
  } catch (error) {
    console.error(`[FRONTEND][${rid}] Failed to fetch collection:`, error);
    return null;
  }
}
