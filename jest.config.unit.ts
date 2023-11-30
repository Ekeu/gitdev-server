import type { Config } from "jest";
import { commonConfig } from "./jest.config";

const config: Config = {
  ...commonConfig,
  coverageDirectory: "coverage/unit",
  testMatch: ["<rootDir>/src/**/tests/**/*.unit.test.ts"],
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
};

export default config;
