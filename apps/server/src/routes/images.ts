import { auth } from "@colorir/auth";
import { createDb } from "@colorir/db";
import { userImages } from "@colorir/db/schema/user-images";
import { getImageUrl } from "@colorir/storage";
import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

const app = new Hono();

app.get("/images", async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session?.user?.id) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}
	const userId = session.user.id;

	const rawPage = c.req.query("page");
	const rawPageSize = c.req.query("pageSize");

	const page = Math.max(1, Number(rawPage) || 1);
	const pageSize = Math.min(
		MAX_PAGE_SIZE,
		Math.max(1, Number(rawPageSize) || DEFAULT_PAGE_SIZE),
	);
	const offset = (page - 1) * pageSize;

	const db = createDb();

	const [countResult] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(userImages)
		.where(eq(userImages.userId, userId));

	const total = Number(countResult?.count ?? 0);

	const rows = await db
		.select({
			id: userImages.id,
			prompt: userImages.prompt,
			estilo: userImages.estilo,
			url: userImages.url,
			createdAt: userImages.createdAt,
		})
		.from(userImages)
		.where(eq(userImages.userId, userId))
		.orderBy(sql`${userImages.createdAt} desc`)
		.limit(pageSize)
		.offset(offset);

	const images = await Promise.all(
		rows.map(async (row) => ({
			id: row.id,
			prompt: row.prompt,
			style: row.estilo,
			url: await getImageUrl(row.url),
			createdAt: row.createdAt.toISOString(),
		})),
	);

	return c.json({ images, total, page, pageSize });
});

export default app;
