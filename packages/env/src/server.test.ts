import { beforeAll, describe, expect, it } from "vitest";

describe("env server", () => {
	beforeAll(() => {
		process.env.DATABASE_URL = "postgres://localhost:5432/test";
		process.env.BETTER_AUTH_SECRET =
			"test-secret-that-is-at-least-32-chars-long!!";
		process.env.BETTER_AUTH_URL = "http://localhost:3000";
		process.env.CORS_ORIGIN = "http://localhost:3001";
		process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
		process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";
	});

	it("should export env module", async () => {
		const mod = await import("./server");
		expect(mod.env).toBeDefined();
		expect(mod.env.DATABASE_URL).toBe("postgres://localhost:5432/test");
	});
});
