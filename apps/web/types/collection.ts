export interface Collection {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  image?: string;
  owner_id: string;
  collaborators?: CollectionCollaborator[];
}

export interface CollectionCollaborator {
  id: string;
  collection_id: string;
  user_id: string;
  email?: string;
  role: "viewer" | "editor" | "admin";
  created_at: string;
  updated_at?: string;
}

export interface GetCollectionsResponse {
  collections: Collection[];
  errorMessage: string;
}

export interface GetCollectionResponse {
  collection: Collection;
  errorMessage: string;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
}

export interface CreateCollectionResponse {
  message: string;
  errorMessage?: string;
}

export interface UpdateCollectionResponse {
  message: string;
  errorMessage?: string;
}

export interface DeleteCollectionResponse {
  message: string;
  errorMessage?: string;
}

// Collaborator types
export interface AddCollaboratorRequest {
  email: string;
  role?: "viewer" | "editor" | "admin";
}

export interface AddCollaboratorResponse {
  collaborator: CollectionCollaborator;
  errorMessage?: string;
}

export interface SearchUsersResponse {
  users: SearchedUser[];
  errorMessage?: string;
}

export interface SearchedUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface RemoveCollaboratorResponse {
  message: string;
  errorMessage?: string;
}
