import nextConfig from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextConfig,
  ...coreWebVitals,
  {
    ignores: ["test/**", "contracts/**", "hardhat.config.js", "hardhat.config.ts"],
  },
  {
    rules: {
      // Relax strict React hooks rules that would require significant code changes
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/exhaustive-deps": "warn",
      "import/no-anonymous-default-export": "warn",
      // Allow unescaped entities in JSX for existing code patterns
      "react/no-unescaped-entities": "warn",
      // Allow using <a> tags for links (some external links need them)
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
];

export default eslintConfig;
