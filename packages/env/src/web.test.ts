import { describe, expect, it } from "vitest";

describe("env web", () => {
	it("should work with VITE_ prefixed env vars", () => {
		expect(typeof "VITE_SERVER_URL").toBe("string");
	});
});
