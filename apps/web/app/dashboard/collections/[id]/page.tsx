import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCollection } from "@/features/collections/service/api";
import { getCollectionFlashcards } from "@/features/flashcards/service/api";
import { CollectionDetailClient } from "./collection-detail-client";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { id } = await params;

  const [collectionData, flashcardsData] = await Promise.all([
    getCollection(id),
    getCollectionFlashcards(id),
  ]);

  if (!collectionData.collection) {
    notFound();
  }

  // Use the role from collection endpoint, or fallback to flashcards role
  const role = collectionData.role || flashcardsData.role;

  return (
    <Suspense fallback={<CollectionDetailSkeleton />}>
      <CollectionDetailClient
        collection={collectionData.collection}
        flashcards={flashcardsData.flashcards}
        role={role}
      />
    </Suspense>
  );
}

function CollectionDetailSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
      </div>
    </div>
  );
}
