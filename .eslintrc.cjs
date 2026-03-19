module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "airbnb/hooks",
    "airbnb-typescript",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/recommended",
    "prettier",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  plugins: [
    "react",
    "@typescript-eslint",
    "react-refresh",
    "require-explicit-generics",
  ],
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      alias: {
        map: [["~", "./src"]],
      },
    },
  },
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "react/react-in-jsx-scope": "off",
    "linebreak-style": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/no-unused-vars": ["warn"],
    "@typescript-eslint/ban-ts-comment": 0,
    "@typescript-eslint/no-floating-promises": [
      "error",
      {
        ignoreIIFE: true,
      },
    ],
    "import/extensions": 0,
    "import/no-unresolved": 0,
    "import/order": [
      "error",
      {
        "newlines-between": "always",
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        pathGroups: [
          {
            pattern: "react*/**",
            group: "external",
            position: "before",
          },
          {
            pattern: "**react*/**",
            group: "external",
            position: "before",
          },
          {
            pattern: "@mui*/**",
            group: "external",
            position: "after",
          },
          {
            pattern: "~/config*/**",
            patternOptions: {
              partial: true,
            },
            group: "external",
            position: "after",
          },
          {
            pattern: "~/assets*/**",
            patternOptions: {
              partial: true,
            },
            group: "internal",
            position: "before",
          },
          {
            pattern: "~/constants*/**",
            patternOptions: {
              partial: true,
            },
            group: "internal",
            position: "before",
          },
          {
            pattern: "~/utils*/**",
            patternOptions: {
              partial: true,
            },
            group: "internal",
            position: "before",
          },
          {
            pattern: "~/router*/**",
            patternOptions: {
              partial: true,
            },
            group: "external",
            position: "after",
          },
          {
            pattern: "~/global*/**",
            patternOptions: {
              partial: true,
            },
            group: "internal",
            position: "before",
          },
          {
            pattern: "~/global-types*/**",
            patternOptions: {
              partial: true,
            },
            group: "internal",
            position: "before",
          },
          {
            pattern: "~/helpers*/**",
            patternOptions: {
              partial: true,
            },
            group: "internal",
            position: "before",
          },
          {
            pattern: "~/store*/**",
            patternOptions: {
              partial: true,
            },
            group: "internal",
            position: "before",
          },
          {
            pattern: "~/context*/**",
            patternOptions: {
              partial: true,
            },
            group: "internal",
            position: "before",
          },
          {
            pattern: "~/layout*/**",
            patternOptions: {
              partial: true,
            },
            group: "internal",
            position: "before",
          },
          {
            pattern: "~/pages*/**",
            patternOptions: {
              partial: true,
            },
            group: "internal",
            position: "before",
          },
          {
            pattern: "~/features*/**",
            patternOptions: {
              partial: true,
            },
            group: "internal",
            position: "before",
          },
          {
            pattern: "~/components**/**",
            patternOptions: {
              partial: true,
            },
            group: "internal",
            position: "after",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
        distinctGroup: true,
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "require-explicit-generics/require-explicit-generics": [
      "error",
      ["React.useState", "useState"],
    ],
    "react/prop-types": 0,
  },
  env: {
    browser: true,
  },
};
