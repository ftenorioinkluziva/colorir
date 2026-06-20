import { z } from "zod";

export const MessageSchema = z.object({
	role: z.enum(["user", "assistant"]),
	content: z.string(),
	id: z.string().optional(),
});

export const ChatRequestSchema = z.object({
	messages: z.array(MessageSchema).min(1, "messages must not be empty"),
});

export const GenerateImageSchema = z.object({
	style: z.enum(["mandala", "cozy", "botanica", "infantil"]),
	prompt: z.string().min(1),
	seed: z.number().int().optional(),
	providerOptions: z.record(z.string(), z.any()).optional(),
});

export type Message = z.infer<typeof MessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type GenerateImageRequest = z.infer<typeof GenerateImageSchema>;
