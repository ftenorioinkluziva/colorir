import { describe, expect, it } from "vitest";

describe("auth client", () => {
	it("should export authClient", async () => {
		// Dynamic import to avoid VITE_SERVER_URL requirement at module level
		const mod = await import("./auth-client");
		expect(mod.authClient).toBeDefined();
	});
});
