import { auth } from "@colorir/auth";
import { createDb } from "@colorir/db";
import { userImages } from "@colorir/db/schema/user-images";
import { userPdfs } from "@colorir/db/schema/user-pdfs";
import { downloadImage, getImageUrl, uploadImage } from "@colorir/storage";
import { and, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { PDFDocument } from "pdf-lib";
import { z } from "zod";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const PDF_MAX_SIZE = 20 * 1024 * 1024; // 20 MB

const GeneratePdfSchema = z.object({
	imageIds: z.array(z.string()).min(1, "At least one image ID is required"),
});

const app = new Hono();

app.post("/generate-pdf", async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session?.user?.id) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}
	const userId = session.user.id;

	const body = await c.req.json();
	const parsed = GeneratePdfSchema.safeParse(body);
	if (!parsed.success) {
		throw Object.assign(new Error("Validation error"), {
			cause: parsed.error,
		});
	}

	const db = createDb();

	const images = await db
		.select({
			id: userImages.id,
			url: userImages.url,
		})
		.from(userImages)
		.where(
			and(
				eq(userImages.userId, userId),
				inArray(userImages.id, parsed.data.imageIds),
			),
		);

	if (images.length === 0) {
		throw new HTTPException(404, {
			message: "No images found for the given IDs",
		});
	}

	if (images.length !== parsed.data.imageIds.length) {
		throw new HTTPException(403, {
			message: "Some images do not belong to you",
		});
	}

	try {
		const imageBuffers = await Promise.all(
			images.map((image) => downloadImage(image.url)),
		);

		const totalSize = imageBuffers.reduce((sum, buf) => sum + buf.length, 0);
		if (totalSize > PDF_MAX_SIZE) {
			throw new HTTPException(413, {
				message: `PDF excede o limite de ${PDF_MAX_SIZE / 1024 / 1024}MB`,
			});
		}

		const pdfDoc = await PDFDocument.create();

		for (const imageBuffer of imageBuffers) {
			const embeddedImage =
				imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8
					? await pdfDoc.embedJpg(imageBuffer)
					: await pdfDoc.embedPng(imageBuffer);

			const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
			const { width, height } = embeddedImage.scale(1);

			const scale = Math.min(
				(A4_WIDTH - 40) / width,
				(A4_HEIGHT - 40) / height,
			);
			const scaledWidth = width * scale;
			const scaledHeight = height * scale;
			const x = (A4_WIDTH - scaledWidth) / 2;
			const y = (A4_HEIGHT - scaledHeight) / 2;

			page.drawImage(embeddedImage, {
				x,
				y,
				width: scaledWidth,
				height: scaledHeight,
			});
		}

		const pdfBytes = await pdfDoc.save();
		const pdfBuffer = Buffer.from(pdfBytes);

		const timestamp = Date.now();
		const filename = `colorir-${timestamp}.pdf`;
		const key = await uploadImage(userId, pdfBuffer, filename);

		const id = crypto.randomUUID();
		await db.insert(userPdfs).values({
			id,
			userId,
			url: key,
			imageCount: images.length,
		});

		const signedUrl = await getImageUrl(key, filename);

		return c.json(
			{
				id,
				url: signedUrl,
				imageCount: images.length,
				createdAt: new Date().toISOString(),
			},
			201,
		);
	} catch (err) {
		console.error("PDF generation failed:", err);
		if (err instanceof HTTPException) {
			throw err;
		}
		throw new HTTPException(500, { message: "PDF generation failed" });
	}
});

export default app;
