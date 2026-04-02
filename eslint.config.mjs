import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "node_modules/**"],
  },
]);

export default eslintConfig;
