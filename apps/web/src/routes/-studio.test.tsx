import { describe, expect, it } from "vitest";

describe("Studio route", () => {
	it("should export Route", async () => {
		const mod = await import("./studio");
		expect(mod.Route).toBeDefined();
	});
});
