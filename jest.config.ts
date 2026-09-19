import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  clearMocks: true,
  coverageProvider: "v8",
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  // MSW v2 conditional exports resolve correctly under Node.
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
};

// next/jest appends to transformIgnorePatterns and would leave /node_modules/
// ignoring ESM-only MSW deps — override after createJestConfig resolves.
const esmPackages = [
  "msw",
  "@mswjs",
  "rettime",
  "until-async",
  "@open-draft",
  "outvariant",
  "strict-event-emitter",
  "headers-polyfill",
].join("|");

export default async () => {
  const jestConfig = await createJestConfig(config)();
  jestConfig.transformIgnorePatterns = [
    `/node_modules/(?!(${esmPackages})/)`,
    "^.+\\.module\\.(css|sass|scss)$",
  ];
  return jestConfig;
};
