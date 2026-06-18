import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		STORAGE_ENDPOINT: z.string().url().optional(),
		STORAGE_ACCESS_KEY: z.string().optional(),
		STORAGE_SECRET_KEY: z.string().optional(),
		STORAGE_BUCKET: z.string().optional(),
		STORAGE_REGION: z.string().optional(),
		STORAGE_USE_SSL: z
			.string()
			.transform((v) => v === "true")
			.optional(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: process.env,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
