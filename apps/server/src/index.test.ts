import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

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

function createApp(nodeEnv: "development" | "production") {
	const app = new Hono();

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

		const isDev = nodeEnv === "development";

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

	app.get("/throw-zod", () => {
		throw new ZodError([
			{
				code: "invalid_type",
				expected: "string",
				path: ["name"],
				message: "Expected string, received number",
			} as any,
		]);
	});

	app.get("/throw-unauthorized", () => {
		throw new HTTPException(401, { message: "Unauthorized" });
	});

	app.get("/throw-forbidden", () => {
		throw new HTTPException(403, { message: "Forbidden" });
	});

	app.get("/throw-unknown", () => {
		throw new Error("Database connection failed");
	});

	app.get("/ok", (c) => c.text("OK"));

	return app;
}

describe("error handler", () => {
	describe("development mode", () => {
		const app = createApp("development");

		it("returns 400 with details for ZodError", async () => {
			const res = await app.request("/throw-zod");
			expect(res.status).toBe(400);
			const body = (await res.json()) as Record<string, unknown>;
			expect(body.error).toBe("Expected string, received number");
			expect(body.details).toHaveLength(1);
			expect((body.details as any)[0].path).toEqual(["name"]);
			expect((body.details as any)[0].code).toBe("invalid_type");
		});

		it("returns 401 for HTTPException(401)", async () => {
			const res = await app.request("/throw-unauthorized");
			expect(res.status).toBe(401);
			const body = (await res.json()) as Record<string, unknown>;
			expect(body.error).toBe("Unauthorized");
		});

		it("returns 403 for HTTPException(403)", async () => {
			const res = await app.request("/throw-forbidden");
			expect(res.status).toBe(403);
			const body = (await res.json()) as Record<string, unknown>;
			expect(body.error).toBe("Forbidden");
		});

		it("returns 500 with stack trace for unknown errors in development", async () => {
			const res = await app.request("/throw-unknown");
			expect(res.status).toBe(500);
			const body = (await res.json()) as Record<string, unknown>;
			expect(body.error).toBe("Internal server error");
			expect(body.stack).toBeDefined();
			expect(typeof body.stack).toBe("string");
		});
	});

	describe("production mode", () => {
		const app = createApp("production");

		it("returns 500 without stack trace", async () => {
			const res = await app.request("/throw-unknown");
			expect(res.status).toBe(500);
			const body = (await res.json()) as Record<string, unknown>;
			expect(body.error).toBe("Internal server error");
			expect(body.stack).toBeUndefined();
		});
	});

	it("allows normal requests to pass through", async () => {
		const app = createApp("development");
		const res = await app.request("/ok");
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("OK");
	});
});
