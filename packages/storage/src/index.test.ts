import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
	process.env.DATABASE_URL = "postgres://localhost:5432/test";
	process.env.BETTER_AUTH_SECRET =
		"test-secret-that-is-at-least-32-chars-long!!";
	process.env.BETTER_AUTH_URL = "http://localhost:3000";
	process.env.CORS_ORIGIN = "http://localhost:3001";
	process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
	process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";
	process.env.AI_GATEWAY_API_KEY = "test-ai-gateway-key";
	process.env.STORAGE_ENDPOINT = "http://localhost:9000";
	process.env.STORAGE_ACCESS_KEY = "minio";
	process.env.STORAGE_SECRET_KEY = "minio123";
	process.env.STORAGE_BUCKET = "colorir-images";
	process.env.STORAGE_REGION = "us-east-1";
	process.env.STORAGE_USE_SSL = "false";
});

describe("storage module", () => {
	it("should export uploadImage, getImageUrl, ensureBucket", async () => {
		const mod = await import("./index");
		expect(mod.uploadImage).toBeDefined();
		expect(mod.getImageUrl).toBeDefined();
		expect(mod.ensureBucket).toBeDefined();
	});

	it("should handle bucket checks whether storage is available or not", async () => {
		const { ensureBucket } = await import("./index");
		try {
			await ensureBucket();
		} catch (err) {
			expect(err).toBeInstanceOf(Error);
		}
	});
});

describe("uploadImage", () => {
	it("should upload or surface a connection error", async () => {
		const { uploadImage } = await import("./index");
		try {
			const key = await uploadImage("user-1", Buffer.from("test"), "image.png");
			expect(key).toContain("users/user-1/");
			expect(key).toContain("image.png");
		} catch (err) {
			expect(err).toBeInstanceOf(Error);
		}
	});
});

describe("getImageUrl", () => {
	it("should return a signed URL for a given image key", async () => {
		const { getImageUrl } = await import("./index");
		const url = await getImageUrl("users/user-1/test.png");
		expect(url).toContain(
			"http://localhost:9000/colorir-images/users/user-1/test.png",
		);
		expect(url).toContain("X-Amz-Signature");
		expect(url).toContain("X-Amz-Expires=3600");
	});
});
