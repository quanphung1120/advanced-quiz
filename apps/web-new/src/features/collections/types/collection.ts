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
