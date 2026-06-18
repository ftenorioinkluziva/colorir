import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
	process.env.DATABASE_URL = "postgres://localhost:5432/test";
	process.env.BETTER_AUTH_SECRET =
		"test-secret-that-is-at-least-32-chars-long!!";
	process.env.BETTER_AUTH_URL = "http://localhost:3000";
	process.env.CORS_ORIGIN = "http://localhost:3001";
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

	it("should handle isNotFound detection", async () => {
		const { ensureBucket } = await import("./index");
		await expect(ensureBucket()).rejects.toThrow();
	});
});

describe("uploadImage", () => {
	it("should reject when client is not connected", async () => {
		const { uploadImage } = await import("./index");
		await expect(
			uploadImage("user-1", Buffer.from("test"), "image.png"),
		).rejects.toThrow();
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
