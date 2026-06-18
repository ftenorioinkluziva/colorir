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

describe("user images schema", () => {
	it("should export userImages table", async () => {
		const mod = await import("../schema/user-images");
		expect(mod.userImages).toBeDefined();
	});

	it("should export userImagesRelations", async () => {
		const mod = await import("../schema/user-images");
		expect(mod.userImagesRelations).toBeDefined();
	});
});
