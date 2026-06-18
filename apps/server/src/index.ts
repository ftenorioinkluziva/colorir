import { auth } from "@colorir/auth";
import { createDb } from "@colorir/db";
import { env } from "@colorir/env/server";
import { ensureBucket } from "@colorir/storage";
import { convertToModelMessages, streamText } from "ai";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { ChatRequestSchema } from "./validation/ai";

const app = new Hono();

ensureBucket().catch((err: unknown) => {
	console.error("Failed to ensure storage bucket:", err);
});

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.get("/health", async (c) => {
	try {
		const db = createDb();
		await db.execute("SELECT 1");
		return c.json({ status: "ok", db: "connected" });
	} catch {
		return c.json({ status: "error", db: "disconnected" }, 503);
	}
});

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.post("/ai", async (c) => {
	const body = await c.req.json();
	const parsed = ChatRequestSchema.safeParse(body);

	if (!parsed.success) {
		const hasTypeErrors = parsed.error.issues.some(
			(issue) => issue.code === "invalid_type",
		);
		return c.json(
			{ error: "Validation failed", details: parsed.error.issues },
			hasTypeErrors ? 422 : 400,
		);
	}

	const result = streamText({
		model: "openai/gpt-5.4",
		messages: await convertToModelMessages(parsed.data.messages as any),
	});

	return result.toUIMessageStreamResponse();
});

app.get("/", (c) => {
	return c.text("OK");
});

function isZodLikeError(err: unknown): err is {
	issues: Array<{ message: string; path: Array<string | number> }>;
	message: string;
} {
	return (
		typeof err === "object" &&
		err !== null &&
		"issues" in err &&
		Array.isArray((err as any).issues)
	);
}

app.use("*", async (_c, next) => {
	try {
		await next();
	} catch (err) {
		if (err instanceof Error) throw err;
		throw Object.assign(new Error((err as any)?.message ?? String(err)), {
			cause: err,
		});
	}
});

app.onError((err, c) => {
	const original = (err as any).cause;
	const isZodError = isZodLikeError(original);

	const status = isZodError
		? 400
		: err instanceof HTTPException
			? err.status
			: 500;

	const isDev = env.NODE_ENV === "development";

	console.error(
		JSON.stringify({
			method: c.req.method,
			path: c.req.path,
			status,
			message: isZodError ? original.issues[0]?.message : err.message,
			...(isDev ? { stack: err.stack } : {}),
		}),
	);

	const body: Record<string, unknown> = {};

	if (isZodError) {
		body.error = original.issues[0]?.message ?? "Validation error";
		body.details = original.issues;
	} else {
		body.error = status === 500 ? "Internal server error" : err.message;
	}

	if (isDev && status === 500) {
		body.stack = err.stack;
	}

	return c.json(body, status as any);
});

export default app;
