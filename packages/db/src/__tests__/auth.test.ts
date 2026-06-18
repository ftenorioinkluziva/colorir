import { describe, expect, it } from "vitest";

describe("auth schema", () => {
	it("should export tables", async () => {
		const mod = await import("../schema/auth");
		expect(mod.user).toBeDefined();
		expect(mod.session).toBeDefined();
		expect(mod.account).toBeDefined();
		expect(mod.verification).toBeDefined();
	});

	it("should export relations", async () => {
		const mod = await import("../schema/auth");
		expect(mod.userRelations).toBeDefined();
		expect(mod.sessionRelations).toBeDefined();
		expect(mod.accountRelations).toBeDefined();
	});
});
