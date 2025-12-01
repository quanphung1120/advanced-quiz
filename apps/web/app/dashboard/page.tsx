import { SearchIcon, DownloadIcon, PlusIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateCollectionDialog } from "@/features/collections/components/create-collection-dialog";
import { CollectionEmptyState } from "@/features/collections/components/collection-empty-state";
import { CollectionCard } from "@/features/collections/components/collection-card";
import { getCollections } from "@/features/collections/service/api";

// Mock data for community decks
const communityDecks = [
  {
    id: "c1",
    title: "AWS Solutions Architect",
    author: "CloudMaster",
    downloads: 12500,
  },
  {
    id: "c2",
    title: "System Design Interview",
    author: "TechInterviewer",
    downloads: 9800,
  },
  {
    id: "c3",
    title: "Python for Data Science",
    author: "DataWizard",
    downloads: 8200,
  },
  {
    id: "c4",
    title: "Kubernetes Fundamentals",
    author: "K8sExpert",
    downloads: 7100,
  },
  {
    id: "c5",
    title: "Machine Learning Basics",
    author: "MLEngineer",
    downloads: 6500,
  },
  {
    id: "c6",
    title: "GraphQL Essentials",
    author: "APIBuilder",
    downloads: 5400,
  },
];

function CommunityDeckCard({
  title,
  author,
  downloads,
}: {
  title: string;
  author: string;
  downloads: number;
}) {
  return (
    <Card className="group transition-colors hover:border-primary/50">
      <CardHeader>
        <CardTitle className="line-clamp-1 text-base">{title}</CardTitle>
        <CardDescription>by {author}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <DownloadIcon className="h-3.5 w-3.5" />
          <span>{downloads.toLocaleString()} downloads</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline" className="w-full">
          Preview
        </Button>
      </CardFooter>
    </Card>
  );
}

export default async function DashboardPage() {
  const collections = await getCollections();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Hero Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Ready to learn?
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Pick up where you left off or discover new collections.
          </p>
        </div>
        <CreateCollectionDialog
          trigger={
            <Button>
              <PlusIcon className="size-4" />
              New Collection
            </Button>
          }
        />
      </div>

      {/* Search Section */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground md:left-4 md:size-5" />
        <Input
          type="search"
          placeholder="Search collections..."
          className="h-10 pl-10 text-sm md:h-12 md:pl-12 md:text-base"
        />
      </div>

      {/* Tabs Interface */}
      <Tabs defaultValue="my-collections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-collections">My Collections</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="my-collections">
          {collections.length === 0 ? (
            <CollectionEmptyState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="community">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {communityDecks.map((deck) => (
              <CommunityDeckCard
                key={deck.id}
                title={deck.title}
                author={deck.author}
                downloads={deck.downloads}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
