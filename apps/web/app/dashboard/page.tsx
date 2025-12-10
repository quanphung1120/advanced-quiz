import { Suspense } from "react";
import { SearchIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { CreateCollectionDialog } from "@/features/collections/components/create-collection-dialog";
import { CollectionEmptyState } from "@/features/collections/components/collection-empty-state";
import { CollectionCard } from "@/features/collections/components/collection-card";
import { getCollections } from "@/features/collections/service/api";
import { CollectionCardSkeletonGrid } from "@/features/dashboard/components/collection-card-skeleton";

async function CollectionsList() {
  const collections = await getCollections();

  if (collections.length === 0) {
    return <CollectionEmptyState />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Dashboard
            </span>
            <h1 className="font-display text-3xl tracking-tight md:text-4xl lg:text-5xl">
              Ready to{" "}
              <span className="bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                learn today?
              </span>
            </h1>
            <p className="max-w-md text-base text-muted-foreground md:text-lg">
              Pick up where you left off or create a new collection to start
              mastering new topics.
            </p>
          </div>
          <CreateCollectionDialog
            trigger={
              <Button
                size="lg"
                className="group gap-2 shadow-lg transition-all hover:shadow-xl hover:shadow-primary/20"
              >
                <PlusIcon className="size-4 transition-transform group-hover:rotate-90" />
                New Collection
              </Button>
            }
          />
        </div>
      </div>

      {/* Search Section using InputGroup */}
      <InputGroup className="h-12 md:h-14">
        <InputGroupAddon align="inline-start">
          <SearchIcon className="size-5 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search your collections..."
          className="md:text-base"
        />
      </InputGroup>

      {/* Collections Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">My Collections</h2>
        <Suspense fallback={<CollectionCardSkeletonGrid count={6} />}>
          <CollectionsList />
        </Suspense>
      </div>
    </div>
  );
}
