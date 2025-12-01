import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCollection } from "@/features/collections/service/api";
import { getCollectionFlashcards } from "@/features/flashcards/service/api";
import { LearningCarouselClient } from "./learning-carousel-client";

interface LearnPageProps {
  params: Promise<{ id: string }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { id } = await params;

  const [collection, flashcardsData] = await Promise.all([
    getCollection(id),
    getCollectionFlashcards(id),
  ]);

  if (!collection) {
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
    <Suspense fallback={<LearningCarouselSkeleton />}>
      <LearningCarouselClient
        collectionId={collection.id}
        collectionName={collection.name}
        flashcards={flashcardsData.flashcards}
      />
    </Suspense>
  );
}

function LearningCarouselSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-2xl px-4 space-y-8">
        <div className="h-6 w-32 bg-muted animate-pulse rounded mx-auto" />
        <div className="h-80 w-full bg-muted animate-pulse rounded-xl" />
        <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
        <div className="flex justify-center gap-4">
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
