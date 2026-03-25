import { fileURLToPath } from "node:url";

import { createReactConfig } from "@advanced-quiz/eslint-config/react";

export default createReactConfig({
  tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
  rules: {
    "react-refresh/only-export-components": "off",
  },
});
