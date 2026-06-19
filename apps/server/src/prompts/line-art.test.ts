import { describe, expect, it } from "vitest";
import {
	buildLineArtPrompt,
	LINE_ART_MODEL,
	LINE_ART_STYLES,
} from "./line-art";

describe("buildLineArtPrompt", () => {
	it("keeps the configured AI Gateway image model explicit", () => {
		expect(LINE_ART_MODEL).toBe("openai/gpt-image-1");
	});

	it("trims and includes the user subject", () => {
		const prompt = buildLineArtPrompt("cozy", "  a cat sleeping near a mug  ");

		expect(prompt).toContain("USER SUBJECT:\na cat sleeping near a mug");
		expect(prompt).not.toContain("  a cat sleeping near a mug  ");
	});

	it("enforces shared B&W line-art constraints for every supported style", () => {
		for (const style of LINE_ART_STYLES) {
			const prompt = buildLineArtPrompt(style, "test subject");

			expect(prompt).toContain("black-and-white line-art coloring page");
			expect(prompt).toContain("pure white background");
			expect(prompt).toContain("clean continuous black outlines");
			expect(prompt).toContain("large enclosed areas suitable for coloring");
			expect(prompt).toContain("No color, grayscale, shading, gradients");
			expect(prompt).toContain("Generate one single image only");
		}
	});

	it("adds distinct style guidance per supported style", () => {
		expect(buildLineArtPrompt("mandala", "subject")).toContain(
			"radial balance",
		);
		expect(buildLineArtPrompt("cozy", "subject")).toContain(
			"home or hygge-inspired",
		);
		expect(buildLineArtPrompt("botanica", "subject")).toContain(
			"leaves, vines, flowers",
		);
		expect(buildLineArtPrompt("infantil", "subject")).toContain(
			"child-friendly",
		);
	});

	it("uses structured sections so model instructions remain parseable", () => {
		const prompt = buildLineArtPrompt("mandala", "subject");

		expect(prompt).toContain("ROLE:");
		expect(prompt).toContain("TASK:");
		expect(prompt).toContain("NON-NEGOTIABLE OUTPUT REQUIREMENTS:");
		expect(prompt).toContain("STYLE DIRECTION:");
		expect(prompt).toContain("QUALITY CHECK BEFORE FINAL IMAGE:");
	});
});
