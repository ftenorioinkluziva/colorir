import { describe, expect, it } from "vitest";
import { ChatRequestSchema, GenerateImageSchema, MessageSchema } from "./ai";

describe("MessageSchema", () => {
	it("validates a valid user message", () => {
		const result = MessageSchema.safeParse({
			role: "user",
			content: "Hello",
		});
		expect(result.success).toBe(true);
	});

	it("validates a valid assistant message", () => {
		const result = MessageSchema.safeParse({
			role: "assistant",
			content: "Hi there",
		});
		expect(result.success).toBe(true);
	});

	it("accepts optional id field", () => {
		const result = MessageSchema.safeParse({
			role: "user",
			content: "Hello",
			id: "msg-1",
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid role", () => {
		const result = MessageSchema.safeParse({
			role: "system",
			content: "Hello",
		});
		expect(result.success).toBe(false);
	});

	it("rejects non-string content", () => {
		const result = MessageSchema.safeParse({
			role: "user",
			content: 123,
		});
		expect(result.success).toBe(false);
	});
});

describe("ChatRequestSchema", () => {
	it("validates a valid chat request", () => {
		const result = ChatRequestSchema.safeParse({
			messages: [{ role: "user", content: "Hello" }],
		});
		expect(result.success).toBe(true);
	});

	it("validates multiple messages", () => {
		const result = ChatRequestSchema.safeParse({
			messages: [
				{ role: "user", content: "Hello" },
				{ role: "assistant", content: "Hi" },
			],
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty messages array", () => {
		const result = ChatRequestSchema.safeParse({
			messages: [],
		});
		expect(result.success).toBe(false);
	});

	it("rejects missing messages field", () => {
		const result = ChatRequestSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it("returns invalid_type code for wrong data types", () => {
		const result = ChatRequestSchema.safeParse({
			messages: [{ role: "user", content: 123 }],
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((i) => i.code === "invalid_type")).toBe(
				true,
			);
		}
	});
});

describe("GenerateImageSchema", () => {
	it("validates required fields only (backward compatible)", () => {
		const result = GenerateImageSchema.safeParse({
			style: "mandala",
			prompt: "a test prompt",
		});
		expect(result.success).toBe(true);
	});

	it("accepts optional seed", () => {
		const result = GenerateImageSchema.safeParse({
			style: "mandala",
			prompt: "test",
			seed: 42,
		});
		expect(result.success).toBe(true);
	});

	it("accepts optional providerOptions", () => {
		const result = GenerateImageSchema.safeParse({
			style: "mandala",
			prompt: "test",
			providerOptions: { google: { key: "value" } },
		});
		expect(result.success).toBe(true);
	});

	it("strips removed fields (aspectRatio, n, size) silently", () => {
		const result = GenerateImageSchema.safeParse({
			style: "mandala",
			prompt: "test",
			aspectRatio: "16:9",
			n: 2,
			size: "1024x1024",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			const data = result.data as Record<string, unknown>;
			expect(data.aspectRatio).toBeUndefined();
			expect(data.n).toBeUndefined();
			expect(data.size).toBeUndefined();
		}
	});
});
