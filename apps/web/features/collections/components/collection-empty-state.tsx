import { FolderPlusIcon } from "lucide-react";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { CreateCollectionDialog } from "./create-collection-dialog";

export function CollectionEmptyState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderPlusIcon className="size-5" />
        </EmptyMedia>
        <EmptyTitle>No collections yet</EmptyTitle>
        <EmptyDescription>
          Create your first collection to start organizing your flashcards.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateCollectionDialog />
      </EmptyContent>
    </Empty>
  );
}
