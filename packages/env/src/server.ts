import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

const envPaths = [
	resolve(process.cwd(), "apps/server/.env"),
	resolve(process.cwd(), "../../apps/server/.env"),
	resolve(process.cwd(), "../../../apps/server/.env"),
	resolve(process.cwd(), ".env"),
	resolve(process.cwd(), "../../.env"),
	resolve(process.cwd(), "../../../.env"),
];

for (const envPath of [...new Set(envPaths)]) {
	if (existsSync(envPath)) {
		dotenv.config({ path: envPath });
	}
}

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		STORAGE_ENDPOINT: z.string().url().default("http://localhost:9000"),
		STORAGE_PUBLIC_ENDPOINT: z.string().url().optional(),
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
		AI_GATEWAY_API_KEY: z.string().min(1),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: process.env,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
