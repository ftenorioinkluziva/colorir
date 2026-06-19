export const LINE_ART_MODEL = "google/gemini-2.5-flash-image";

export const LINE_ART_STYLES = [
	"mandala",
	"cozy",
	"botanica",
	"infantil",
] as const;

export type LineArtStyle = (typeof LINE_ART_STYLES)[number];

type StylePromptConfig = {
	label: string;
	direction: string;
	composition: string;
	avoid: string;
};

export const LINE_ART_STYLE_CONFIGS: Record<LineArtStyle, StylePromptConfig> = {
	mandala: {
		label: "Mandala",
		direction:
			"Create a symmetrical mandala coloring page with radial balance, concentric rings, repeated motifs, and clearly separated sections.",
		composition:
			"Use centered composition, consistent spacing, geometric/floral repetition, and enclosed shapes that are large enough to color.",
		avoid:
			"Do not create an asymmetric illustration, realistic scene, loose sketch, or overly dense micro-detail.",
	},
	cozy: {
		label: "Cozy",
		direction:
			"Create a warm, comfortable home or hygge-inspired coloring page while preserving strict black-and-white line-art.",
		composition:
			"Use a clear focal area, recognizable cozy objects, simple room depth, and separated objects with visible whitespace.",
		avoid:
			"Do not use soft lighting effects, shadows, painterly texture, photorealism, or gray tonal atmosphere.",
	},
	botanica: {
		label: "Botanica",
		direction:
			"Create a botanical coloring page with leaves, vines, flowers, stems, branches, and organic natural rhythm.",
		composition:
			"Use a balanced wreath, vertical bouquet, or framed botanical arrangement with distinct plant silhouettes and clean intersections.",
		avoid:
			"Do not create color botanical art, dense background foliage, grayscale leaf texture, or realistic shaded illustration.",
	},
	infantil: {
		label: "Infantil",
		direction:
			"Create a child-friendly coloring page with cute, simple, friendly characters or objects that are easy for young children to color.",
		composition:
			"Use oversized simple shapes, expressive faces when relevant, low detail density, broad enclosed spaces, and playful spacing.",
		avoid:
			"Do not use scary themes, complex patterns, tiny details, mature visual style, or realistic rendering.",
	},
};

const BASE_REQUIREMENTS = [
	"Generate one single image only.",
	"Output must be a black-and-white line-art coloring page.",
	"Use pure white background and clean continuous black outlines.",
	"Use large enclosed areas suitable for coloring.",
	"Keep edges crisp and readable at thumbnail and print size.",
	"No color, grayscale, shading, gradients, shadows, hatching, cross-hatching, stippling, texture, filled black areas, text, watermark, logo, frame, or border.",
] as const;

export function buildLineArtPrompt(style: LineArtStyle, userPrompt: string) {
	const config = LINE_ART_STYLE_CONFIGS[style];
	const subject = userPrompt.trim();

	return [
		"ROLE:",
		"You are an expert coloring-book line-art image generator.",
		"",
		"TASK:",
		`Generate a ${config.label} style coloring page from the user subject.`,
		"",
		"NON-NEGOTIABLE OUTPUT REQUIREMENTS:",
		...BASE_REQUIREMENTS.map((requirement) => `- ${requirement}`),
		"",
		"STYLE DIRECTION:",
		`- ${config.direction}`,
		`- ${config.composition}`,
		`- ${config.avoid}`,
		"",
		"USER SUBJECT:",
		subject,
		"",
		"QUALITY CHECK BEFORE FINAL IMAGE:",
		"- Confirm the result is strict B&W line-art, not grayscale artwork.",
		"- Confirm the drawing has clean closed regions for coloring.",
		"- Confirm the selected style is visually obvious.",
	].join("\n");
}
