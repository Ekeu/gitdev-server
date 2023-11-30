import { Config } from "jest";

export const commonConfig: Config = {
  verbose: true,
  preset: "ts-jest",
  collectCoverage: true,
  testEnvironment: "node",
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "html"],
  transform: { "^.+\\.ts?$": "ts-jest" },
  moduleNameMapper: {
    "@/(.*)": ["<rootDir>/src/$1"],
    "@config/(.*)": ["<rootDir>/src/config/$1"],
    "@utils/(.*)": ["<rootDir>/src/utils/$1"],
    "@components/(.*)": ["<rootDir>/src/components/$1"],
    "@middlewares/(.*)": ["<rootDir>/src/middlewares/$1"],
    "@helpers/(.*)": ["<rootDir>/src/helpers/$1"],
  },
};
