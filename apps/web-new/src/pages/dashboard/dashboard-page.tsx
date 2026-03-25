import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Badge } from "@advanced-quiz/ui/components/badge";
import { Button } from "@advanced-quiz/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@advanced-quiz/ui/components/input-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@advanced-quiz/ui/components/tabs";
import { LoadingState } from "@/components/loading-state";
import { CollectionCard } from "@/features/collections/components/collection-card";
import { CollectionEmptyState } from "@/features/collections/components/collection-empty-state";
import { CollectionFormModal } from "@/features/collections/components/collection-form-modal";
import {
  useCollections,
  useCreateCollection,
} from "@/features/collections/hooks/use-collections";
import type { Collection } from "@/features/collections/types/collection";

type DashboardLane = "owned" | "shared";
type DashboardFilter = "all" | DashboardLane;

type DashboardCollection = Collection & {
  lane: DashboardLane;
};

const EMPTY_COLLECTIONS: Collection[] = [];

function matchesQuery(query: string, collection: DashboardCollection) {
  if (!query) {
    return true;
  }

  const haystack = [
    collection.name,
    collection.description ?? "",
    collection.lane,
    collection.isPublic ? "public" : "private",
  ]
    .join(" ")
    .trim()
    .toLowerCase();

  return haystack.includes(query);
}

function buildCollections(
  ownedCollections: Collection[],
  sharedCollections: Collection[],
) {
  return [
    ...ownedCollections.map((collection) => ({
      ...collection,
      lane: "owned" as const,
    })),
    ...sharedCollections.map((collection) => ({
      ...collection,
      lane: "shared" as const,
    })),
  ].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function DashboardLoadingState() {
  return <LoadingState />;
}

export function DashboardPage() {
  const [searchValue, setSearchValue] = useState("");
  const [dashboardFilter, setDashboardFilter] =
    useState<DashboardFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const deferredSearch = useDeferredValue(searchValue.trim().toLowerCase());

  const collectionsQuery = useCollections();
  const createCollection = useCreateCollection();

  const ownedCollections =
    collectionsQuery.data?.ownedCollections ?? EMPTY_COLLECTIONS;
  const sharedCollections =
    collectionsQuery.data?.sharedCollections ?? EMPTY_COLLECTIONS;

  const collections = useMemo(
    () => buildCollections(ownedCollections, sharedCollections),
    [ownedCollections, sharedCollections],
  );

  const filteredCollections = useMemo(
    () =>
      collections.filter((collection) => {
        if (dashboardFilter !== "all" && collection.lane !== dashboardFilter) {
          return false;
        }

        return matchesQuery(deferredSearch, collection);
      }),
    [collections, dashboardFilter, deferredSearch],
  );

  const ownedVisible = filteredCollections.filter(
    (collection) => collection.lane === "owned",
  );
  const sharedVisible = filteredCollections.filter(
    (collection) => collection.lane === "shared",
  );
  const hasResults = filteredCollections.length > 0;
  const hasCollections = collections.length > 0;
  const totalVisibleCount = filteredCollections.length;

  const collectionSections =
    dashboardFilter === "all"
      ? [
          {
            key: "owned" as const,
            label: "Owned collections",
            description: "Collections you manage directly.",
            items: ownedVisible,
          },
          {
            key: "shared" as const,
            label: "Shared with you",
            description: "Collections shared into your workspace.",
            items: sharedVisible,
          },
        ]
      : [
          {
            key: dashboardFilter,
            label:
              dashboardFilter === "owned"
                ? "Owned collections"
                : "Shared with you",
            description:
              dashboardFilter === "owned"
                ? "Collections you manage directly."
                : "Collections shared into your workspace.",
            items: dashboardFilter === "owned" ? ownedVisible : sharedVisible,
          },
        ];

  return (
    <div className="flex flex-col gap-6 pb-8">
      {collectionsQuery.isPending ? (
        <DashboardLoadingState />
      ) : (
        <Tabs
          value={dashboardFilter}
          onValueChange={(value) =>
            setDashboardFilter(value as DashboardFilter)
          }
          className="flex flex-col gap-6"
        >
          <section className="flex flex-col gap-5 border-b pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Collections</Badge>
              <span className="text-sm text-muted-foreground">
                {totalVisibleCount} visible
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Collection listing
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Search your workspace, switch ownership views, and open the
                collection you need.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <InputGroup className="h-9 flex-1 lg:max-w-xl">
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <Search />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  value={searchValue}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    startTransition(() => {
                      setSearchValue(nextValue);
                    });
                  }}
                  placeholder="Search collections by title, visibility, or ownership"
                />
              </InputGroup>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <TabsList
                  variant="line"
                  className="w-full justify-start sm:w-auto"
                >
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="owned">Owned</TabsTrigger>
                  <TabsTrigger value="shared">Shared</TabsTrigger>
                </TabsList>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus data-icon="inline-start" />
                  New collection
                </Button>
              </div>
            </div>
          </section>

          <TabsContent value={dashboardFilter} className="flex flex-col gap-6">
            {!hasCollections || !hasResults ? (
              <CollectionEmptyState
                hasSearch={Boolean(deferredSearch)}
                onCreate={() => setIsCreateOpen(true)}
              />
            ) : (
              collectionSections.map((section) =>
                section.items.length > 0 ? (
                  <section key={section.key} className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-medium tracking-tight">
                          {section.label}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {section.items.length} result
                        {section.items.length === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    <div className="overflow-hidden border border-border bg-card/40">
                      {section.items.map((collection, index) => (
                        <CollectionCard
                          key={collection.id}
                          collection={collection}
                          scope={section.key}
                          isLast={index === section.items.length - 1}
                        />
                      ))}
                    </div>
                  </section>
                ) : null,
              )
            )}
          </TabsContent>
        </Tabs>
      )}

      <CollectionFormModal
        key={`dashboard-create-${isCreateOpen ? "open" : "closed"}`}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create Collection"
        description="Organise your knowledge into a focused deck. Start with a clear title and description."
        submitLabel="Create collection"
        isPending={createCollection.isPending}
        onSubmit={async (values) => {
          await createCollection.mutateAsync(values);
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
}
