import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/sanjeevani?schema=public"),
    BETTER_AUTH_SECRET: z.string().min(32).default("7a6c9c64b58ad4e5c45e67bc9812e34fa98d245c43d2c18abde1762cba39d5e2"),
    BETTER_AUTH_URL: z.string().min(1).default("http://localhost:3000"),
    CORS_ORIGIN: z.string().min(1).default("http://localhost:3001"),
    GEMINI_API_KEY: z.string().min(1).optional(),
    GEMINI_MODEL: z.string().min(1).optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.CI === "true",
});

console.log(env.GEMINI_API_KEY);
console.log(env.GEMINI_MODEL);
