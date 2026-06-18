/**
 * Spike: AI Gateway Image Generation Test
 *
 * Tests line-art generation via AI SDK with Google Gemini for 4 curated styles.
 *
 * Usage:
 *   export GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
 *   bun run apps/server/src/validation/generate-image.ts
 *
 * Or via the server:
 *   curl -X POST http://localhost:3000/api/generate-image \
 *     -H "Content-Type: application/json" \
 *     -d '{"style":"mandala","prompt":"..."}'
 */

import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { generateText } from "ai";

// ============================================================
// Configuration
// ============================================================

const MODEL = "google/gemini-2.5-flash-image";
const OUTPUT_DIR = "spike-output";

// ============================================================
// Prompt Templates per Style
// ============================================================

const STYLE_CONFIGS = {
	mandala: {
		label: "Mandala",
		system:
			"You are a line-art coloring page generator. Generate only B&W line-art with no shading, no gradients, and no filled areas. Use thick, clean, continuous black strokes on a white background. The design must be a symmetrical mandala with distinct sections suitable for coloring.",
		prompts: [
			"A large symmetrical mandala with concentric rings of petals, geometric diamonds, and dotwork borders. Clean bold outlines, no filled areas, white background.",
			"Floral mandala with lotus center, layered petals radiating outward, and intricate border patterns. Black line-art on white, suitable for coloring.",
		],
	},
	cozy: {
		label: "Cozy (Aconchegante)",
		system:
			"You are a line-art coloring page generator. Generate only B&W line-art with no shading, no gradients, and no filled areas. Use thick, clean, continuous black strokes on a white background. The scene should feel warm, comfortable, and inviting.",
		prompts: [
			"A cozy living room with a sofa, cushion, lamp casting soft light, a mug on a side table, and a sleeping cat. Clean line-art, black outlines only, white background.",
			"A hygge-style tea corner: kettle, ceramic teapot, two cups, a small plant, and an open book. Simple B&W line-art suitable for coloring.",
		],
	},
	botanica: {
		label: "Botânica",
		system:
			"You are a line-art coloring page generator. Generate only B&W line-art with no shading, no gradients, and no filled areas. Use thick, clean, continuous black strokes on a white background. Focus on botanical elements: leaves, vines, flowers, and branches.",
		prompts: [
			"A botanical composition of monstera leaves, ferns, and trailing vines arranged in a wreath. Clean black line-art, white background, coloring book style.",
			"A vertical botanical illustration with a blooming rose, eucalyptus branches, daisies, and delicate leaves. B&W line-art with thick outlines.",
		],
	},
	infantil: {
		label: "Infantil",
		system:
			"You are a line-art coloring page generator for children. Generate only B&W line-art with no shading, no gradients, and no filled areas. Use thick, clean, continuous black strokes on a white background. Keep shapes simple, cute, and easy to color for young children.",
		prompts: [
			"A cute cartoon bunny holding a big carrot, sitting in a small garden with flowers and a butterfly. Simple thick black outlines, white background, coloring page for kids.",
			"A friendly dinosaur with a smiling face, surrounded by small clouds and a sun. Easy-to-color B&W line-art with bold clean strokes.",
		],
	},
};

// ============================================================
// Main
// ============================================================

async function main() {
	if (!existsSync(OUTPUT_DIR)) {
		mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	const results: Record<
		string,
		{ prompt: string; success: boolean; error?: string }[]
	> = {};

	for (const [key, config] of Object.entries(STYLE_CONFIGS)) {
		console.log(`\n${"=".repeat(60)}`);
		console.log(`[${config.label}]`);
		console.log(`${"=".repeat(60)}`);

		results[key] = [];

		for (const prompt of config.prompts) {
			console.log(`\nPrompt: ${prompt.slice(0, 80)}...`);
			console.log(`Model: ${MODEL}`);

			try {
				const result = await generateText({
					model: MODEL,
					prompt: `${config.system}\n\n${prompt}`,
				});

				const images = result.files?.filter(
					(f): f is NonNullable<typeof f> =>
						!!f.mediaType?.startsWith("image/"),
				);

				if (images && images.length > 0) {
					for (const file of images) {
						const ext = file.mediaType.split("/").at(1) ?? "png";
						const filename = `${key}-${results[key].length}.${ext}`;
						const filepath = `${OUTPUT_DIR}/${filename}`;
						await writeFile(filepath, file.uint8Array);
						console.log(`  ✓ Saved: ${filepath} (${file.mediaType})`);
					}
					results[key].push({ prompt, success: true });
				} else {
					if (result.text?.startsWith("data:image")) {
						const base64Data = result.text.split(",")[1];
						const buffer = Buffer.from(base64Data ?? "", "base64");
						const filename = `${key}-${results[key].length}.png`;
						const filepath = `${OUTPUT_DIR}/${filename}`;
						await writeFile(filepath, buffer);
						console.log(`  ✓ Saved (data URL): ${filepath}`);
						results[key].push({ prompt, success: true });
					} else {
						console.log(
							`  ✗ No image in response. Text: ${result.text?.slice(0, 100)}`,
						);
						results[key].push({
							prompt,
							success: false,
							error: "No image generated",
						});
					}
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				console.log(`  ✗ Error: ${message}`);
				results[key].push({ prompt, success: false, error: message });
			}
		}
	}

	// Summary
	console.log(`\n${"=".repeat(60)}`);
	console.log("SUMMARY");
	console.log(`${"=".repeat(60)}`);
	for (const [key, items] of Object.entries(results)) {
		const success = items.filter((i) => i.success).length;
		const total = items.length;
		console.log(`  ${key}: ${success}/${total} succeeded`);
		for (const item of items) {
			if (!item.success) {
				console.log(`    ✗ ${item.prompt.slice(0, 60)}... -> ${item.error}`);
			}
		}
	}

	// Print results JSON for documentation
	console.log(`\n${"=".repeat(60)}`);
	console.log("RESULTS (JSON)");
	console.log(`${"=".repeat(60)}`);
	console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
