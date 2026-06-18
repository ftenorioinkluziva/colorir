import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		STORAGE_ENDPOINT: z.string().url().default("http://localhost:9000"),
		STORAGE_ACCESS_KEY: z.string().default("minio"),
		STORAGE_SECRET_KEY: z.string().default("minio123"),
		STORAGE_BUCKET: z.string().default("colorir-images"),
		STORAGE_REGION: z.string().default("us-east-1"),
		STORAGE_USE_SSL: z
			.string()
			.default("false")
			.transform((v) => v === "true"),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		GOOGLE_GENERATIVE_AI_API_KEY: z.string().default(""),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: process.env,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
