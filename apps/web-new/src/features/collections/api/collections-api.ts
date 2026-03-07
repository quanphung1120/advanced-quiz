import { api } from "@/lib/api-client";

export type CollaboratorRole = "viewer" | "editor" | "admin";
export type CollectionRole = "owner" | "viewer" | "editor" | "admin";

export interface CollectionCollaborator {
  id: string;
  collectionId: string;
  userId: string;
  email?: string;
  role: CollaboratorRole;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  collaborators?: CollectionCollaborator[];
}

export interface ListCollectionsResponse {
  ownedCollections: Collection[];
  sharedCollections: Collection[];
}

export interface GetCollectionResponse {
  collection: Collection;
  role: CollectionRole;
}

export const collectionsApi = {
  list: async () => {
    const res = await api.get<ListCollectionsResponse>("/api/v1/collections/me");
    return res.data;
  },
  get: async (id: string) => {
    const res = await api.get<GetCollectionResponse>(`/api/v1/collections/${id}`);
    return res.data;
  },
  create: async (data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }) => {
    const res = await api.post<Collection>("/api/v1/collections", data);
    return res.data;
  },
  update: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      isPublic?: boolean;
    },
  ) => {
    const res = await api.put<Collection>(`/api/v1/collections/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/v1/collections/${id}`);
  },
  searchUsers: async (query: string) => {
    const res = await api.get<{ emails: string[] }>(
      "/api/v1/users/search-email-addresses",
      {
        params: { query },
      },
    );
    return res.data.emails;
  },
  addCollaborator: async (
    id: string,
    data: {
      email: string;
      role: CollaboratorRole;
    },
  ) => {
    const res = await api.post<{ collaborator: CollectionCollaborator }>(
      `/api/v1/collections/${id}/collaborators`,
      data,
    );
    return res.data.collaborator;
  },
  removeCollaborator: async (id: string, collaboratorId: string) => {
    await api.delete(
      `/api/v1/collections/${id}/collaborators/${collaboratorId}`,
    );
  },
};
