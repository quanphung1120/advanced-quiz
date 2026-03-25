import { fileURLToPath } from "node:url";

import { createNodeConfig } from "@advanced-quiz/eslint-config/node";

export default createNodeConfig({
  tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
});
