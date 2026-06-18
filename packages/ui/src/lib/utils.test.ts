import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
	it("should merge class names", () => {
		expect(cn("px-4", "py-2")).toBe("px-4 py-2");
	});

	it("should handle conditional classes", () => {
		expect(cn("base", false && "hidden", "visible")).toBe("base visible");
	});

	it("should return empty string for no args", () => {
		expect(cn()).toBe("");
	});
});
