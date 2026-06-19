import {
	CreateBucketCommand,
	GetObjectCommand,
	HeadBucketCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@colorir/env/server";

let client: S3Client | null = null;

function getClient(): S3Client {
	if (!client) {
		client = new S3Client({
			endpoint: env.STORAGE_ENDPOINT,
			region: env.STORAGE_REGION,
			credentials: {
				accessKeyId: env.STORAGE_ACCESS_KEY,
				secretAccessKey: env.STORAGE_SECRET_KEY,
			},
			forcePathStyle: true,
		});
	}
	return client;
}

export async function ensureBucket(): Promise<void> {
	const c = getClient();
	const bucket = env.STORAGE_BUCKET;
	try {
		await c.send(new HeadBucketCommand({ Bucket: bucket }));
	} catch (err: unknown) {
		if (isNotFound(err)) {
			await c.send(new CreateBucketCommand({ Bucket: bucket }));
		} else {
			throw err;
		}
	}
}

export async function uploadImage(
	userId: string,
	buffer: Buffer,
	filename: string,
): Promise<string> {
	const c = getClient();
	const bucket = env.STORAGE_BUCKET;
	const key = `users/${userId}/${Date.now()}_${filename}`;

	const ext = filename.split(".").pop()?.toLowerCase();
	const contentType =
		ext === "png"
			? "image/png"
			: ext === "webp"
				? "image/webp"
				: ext === "pdf"
					? "application/pdf"
					: "image/jpeg";

	await c.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: buffer,
			ContentType: contentType,
		}),
	);

	return key;
}

export async function getImageUrl(
	imageId: string,
	filename?: string,
): Promise<string> {
	const bucket = env.STORAGE_BUCKET;
	const publicEndpoint = env.STORAGE_PUBLIC_ENDPOINT ?? env.STORAGE_ENDPOINT;
	const publicClient = new S3Client({
		endpoint: publicEndpoint,
		region: env.STORAGE_REGION,
		credentials: {
			accessKeyId: env.STORAGE_ACCESS_KEY,
			secretAccessKey: env.STORAGE_SECRET_KEY,
		},
		forcePathStyle: true,
	});

	const command = new GetObjectCommand({
		Bucket: bucket,
		Key: imageId,
		...(filename && {
			ResponseContentDisposition: `attachment; filename="${filename}"`,
		}),
	});

	return getSignedUrl(publicClient, command, { expiresIn: 3600 });
}

export async function downloadImage(key: string): Promise<Buffer> {
	const c = getClient();
	const bucket = env.STORAGE_BUCKET;

	const command = new GetObjectCommand({
		Bucket: bucket,
		Key: key,
	});

	const response = await c.send(command);
	const body = await response.Body?.transformToByteArray();
	if (!body) {
		throw new Error(`Failed to download image: ${key}`);
	}
	return Buffer.from(body);
}

function isNotFound(err: unknown): boolean {
	if (err instanceof Error) {
		const awsError = err as Error & {
			$metadata?: { httpStatusCode?: number };
		};
		const name = awsError.name;
		const status = awsError.$metadata?.httpStatusCode;
		return name === "NotFound" || status === 404;
	}
	return false;
}
