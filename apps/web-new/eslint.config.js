import { fileURLToPath } from "node:url";

import { createReactConfig } from "@advanced-quiz/eslint-config/react";

export default createReactConfig({
  tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@/config",
            message:
              "Use direct-file imports in apps/web-new instead of local barrel imports.",
          },
          {
            name: "@/context",
            message:
              "Use direct-file imports in apps/web-new instead of local barrel imports.",
          },
          {
            name: "@/layouts",
            message:
              "Use direct-file imports in apps/web-new instead of local barrel imports.",
          },
          {
            name: "@/pages",
            message:
              "Use direct-file imports in apps/web-new instead of local barrel imports.",
          },
          {
            name: "@/utils",
            message:
              "Use direct-file imports in apps/web-new instead of local barrel imports.",
          },
          {
            name: "@/features/auth",
            message:
              "Use direct-file imports in apps/web-new instead of local barrel imports.",
          },
          {
            name: "@/features/chat",
            message:
              "Use direct-file imports in apps/web-new instead of local barrel imports.",
          },
          {
            name: "@/features/collections",
            message:
              "Use direct-file imports in apps/web-new instead of local barrel imports.",
          },
          {
            name: "@/features/flashcards",
            message:
              "Use direct-file imports in apps/web-new instead of local barrel imports.",
          },
          {
            name: "@/features/reviews",
            message:
              "Use direct-file imports in apps/web-new instead of local barrel imports.",
          },
          {
            name: "@/features/auth/types",
            message:
              "Import from the defining types file instead of the types barrel.",
          },
          {
            name: "@/features/chat/types",
            message:
              "Import from the defining types file instead of the types barrel.",
          },
          {
            name: "@/features/collections/types",
            message:
              "Import from the defining types file instead of the types barrel.",
          },
          {
            name: "@/features/flashcards/types",
            message:
              "Import from the defining types file instead of the types barrel.",
          },
          {
            name: "@/features/reviews/types",
            message:
              "Import from the defining types file instead of the types barrel.",
          },
        ],
      },
    ],
  },
});
