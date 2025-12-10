"use client";

import { useSRSSession } from "@/features/flashcards/hooks/use-srs-session";
import { SRSLearningView } from "@/features/flashcards/components/srs-learning-view";

interface SRSLearningClientProps {
  collectionId: string;
  collectionName: string;
}

export function SRSLearningClient({
  collectionId,
  collectionName,
}: SRSLearningClientProps) {
  const session = useSRSSession(collectionId);

  return (
    <SRSLearningView
      collectionId={collectionId}
      collectionName={collectionName}
      isLoading={session.isLoading}
      hasCards={session.hasCards}
      isSessionComplete={session.isSessionComplete}
      isStartingSession={session.isStartingSession}
      isSubmitting={session.isSubmitting}
      isFlipped={session.isFlipped}
      currentIndex={session.currentIndex}
      reviewedCount={session.reviewedCount}
      reviews={session.reviews}
      currentReview={session.currentReview}
      stats={session.stats}
      onStartSession={session.handleStartSession}
      onFlip={session.handleFlip}
      onRate={session.handleRate}
      onReset={session.handleReset}
    />
  );
}
