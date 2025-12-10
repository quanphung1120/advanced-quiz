import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getCollection } from "@/features/collections/service/api";
import { getCollectionFlashcards } from "@/features/flashcards/service/api";
import { SRSLearningClient } from "@/features/flashcards/components/srs-learning-client";

interface SRSLearnPageProps {
  params: Promise<{ id: string }>;
}

export default async function SRSLearnPage({ params }: SRSLearnPageProps) {
  const { id } = await params;

  // Only fetch collection info to validate access and get the name
  // All review data is fetched client-side with useSWR
  const [collectionData, flashcardsData] = await Promise.all([
    getCollection(id),
    getCollectionFlashcards(id),
  ]);

  if (!collectionData.collection) {
    notFound();
  }

  if (flashcardsData.flashcards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 px-4">
          <h1 className="text-2xl font-semibold">No flashcards yet</h1>
          <p className="text-muted-foreground max-w-md">
            This collection doesn&apos;t have any flashcards to study. Add some
            flashcards to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<SRSLearningSkeleton />}>
      <SRSLearningClient
        collectionId={collectionData.collection.id}
        collectionName={collectionData.collection.name}
      />
    </Suspense>
  );
}

function SRSLearningSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="size-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">
          Loading your learning session...
        </p>
      </div>
    </div>
  );
}
