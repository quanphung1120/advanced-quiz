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

const CollectionSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  owner_id: z.string(),
  is_public: z.boolean().optional(),
  collaborators: z.array(CollectionCollaboratorSchema).optional(),
});

const GetMyCollectionsResponseSchema = z.object({
  owned_collections: z.array(CollectionSchema).nullable(),
  shared_collections: z.array(CollectionSchema).nullable(),
  errorMessage: z.string().optional(),
});

const GetCollectionResponseSchema = z.object({
  collection: CollectionSchema.nullable(),
  role: z.enum(["owner", "editor", "viewer"]).optional(),
  errorMessage: z.string().optional(),
});

const SearchUsersResponseSchema = z.object({
  emails: z.array(z.string()).nullable(),
});

// ============================================================
// Types (inferred from Zod schemas)
// ============================================================

export type Collection = z.infer<typeof CollectionSchema>;
export type CollectionCollaborator = z.infer<
  typeof CollectionCollaboratorSchema
>;

// ============================================================
// API Configuration
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ============================================================
// API Functions
// ============================================================

export const getCollections = async (): Promise<Collection[]> => {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    const parsed = GetMyCollectionsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse getCollections response:", parsed.error);
      return [];
    }

    return [
      ...(parsed.data.owned_collections || []),
      ...(parsed.data.shared_collections || []),
    ];
  } catch {
    return [];
  }
};

export async function getMyCollections(): Promise<{
  owned: Collection[];
  shared: Collection[];
}> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return { owned: [], shared: [] };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { owned: [], shared: [] };
    }

    const json = await response.json();
    const parsed = GetMyCollectionsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse getMyCollections response:", parsed.error);
      return { owned: [], shared: [] };
    }

    return {
      owned: parsed.data.owned_collections || [],
      shared: parsed.data.shared_collections || [],
    };
  } catch {
    return { owned: [], shared: [] };
  }
}

export async function getCollection(id: string): Promise<{
  collection: Collection | null;
  role: "owner" | "editor" | "viewer" | null;
}> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return { collection: null, role: null };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { collection: null, role: null };
    }

    const json = await response.json();
    const parsed = GetCollectionResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse getCollection response:", parsed.error);
      return { collection: null, role: null };
    }

    return {
      collection: parsed.data.collection || null,
      role: parsed.data.role || null,
    };
  } catch {
    return { collection: null, role: null };
  }
}

export async function searchUsersByEmail(query: string): Promise<string[]> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return [];
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
      return [];
    }

    const json = await response.json();
    const parsed = SearchUsersResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error(
        "Failed to parse searchUsersByEmail response:",
        parsed.error
      );
      return [];
    }

    return parsed.data.emails || [];
  } catch {
    return [];
  }
}
