import { auth } from "@colorir/auth";
import { createDb } from "@colorir/db";
import { userImages } from "@colorir/db/schema/user-images";
import { env } from "@colorir/env/server";
import { getImageUrl, uploadImage } from "@colorir/storage";
import { generateText } from "ai";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { GenerateImageSchema } from "../validation/ai";

const SYSTEM_INSTRUCTIONS = {
	mandala:
		"You are a line-art coloring page generator. Generate only B&W line-art with no shading, no gradients, and no filled areas. Use thick, clean, continuous black strokes on a white background. The design must be a symmetrical mandala with distinct sections suitable for coloring.",
	cozy: "You are a line-art coloring page generator. Generate only B&W line-art with no shading, no gradients, and no filled areas. Use thick, clean, continuous black strokes on a white background. The scene should feel warm, comfortable, and inviting.",
	botanica:
		"You are a line-art coloring page generator. Generate only B&W line-art with no shading, no gradients, and no filled areas. Use thick, clean, continuous black strokes on a white background. Focus on botanical elements: leaves, vines, flowers, and branches.",
	infantil:
		"You are a line-art coloring page generator for children. Generate only B&W line-art with no shading, no gradients, and no filled areas. Use thick, clean, continuous black strokes on a white background. Keep shapes simple, cute, and easy to color for young children.",
} as const;

const MAX_DAILY_IMAGES = 20;

const app = new Hono();

app.post("/generate-image", async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session?.user?.id) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}
	const userId = session.user.id;

	const body = await c.req.json();
	const parsed = GenerateImageSchema.safeParse(body);
	if (!parsed.success) {
		throw Object.assign(new Error("Validation error"), {
			cause: parsed.error,
		});
	}
	const { style, prompt } = parsed.data;

	const db = createDb();
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const [countResult] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(userImages)
		.where(
			and(
				eq(userImages.userId, userId),
				sql`${userImages.createdAt} >= ${today}`,
			),
		);

	if (Number(countResult?.count ?? 0) >= MAX_DAILY_IMAGES) {
		throw new HTTPException(429, {
			message: "Daily image limit exceeded (20/day)",
		});
	}

	if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
		throw new HTTPException(500, {
			message: "AI provider not configured",
		});
	}

	const systemInstruction = SYSTEM_INSTRUCTIONS[style];
	const result = await generateText({
		model: "google/gemini-2.5-flash-image",
		prompt: `${systemInstruction}\n\n${prompt}`,
	});

	const imageFile = result.files?.find((f) =>
		f?.mediaType?.startsWith("image/"),
	);
	if (!imageFile?.uint8Array) {
		throw new HTTPException(500, { message: "AI did not return an image" });
	}

	const ext = imageFile.mediaType?.split("/").at(1) ?? "png";
	const filename = `${style}_${Date.now()}.${ext}`;
	const key = await uploadImage(
		userId,
		Buffer.from(imageFile.uint8Array),
		filename,
	);
	const url = await getImageUrl(key);

	const id = crypto.randomUUID();
	await db.insert(userImages).values({
		id,
		userId,
		estilo: style,
		prompt,
		url: key,
	});

	return c.json(
		{
			id,
			url,
			style,
			prompt,
			createdAt: new Date().toISOString(),
		},
		201,
	);
});

export default app;
