import { createDb } from "@colorir/db";
import * as schema from "@colorir/db/schema/auth";
import { env } from "@colorir/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export function createAuth() {
	const db = createDb();
	const isProduction = env.NODE_ENV === "production";

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",

			schema: schema,
		}),
		trustedOrigins: [env.CORS_ORIGIN],
		emailAndPassword: {
			enabled: true,
		},
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		advanced: {
			defaultCookieAttributes: {
				sameSite: isProduction ? "none" : "lax",
				secure: isProduction,
				httpOnly: true,
			},
		},
		plugins: [],
	});
}

export const auth = createAuth();
