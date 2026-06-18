import { z } from "zod";

export const MessageSchema = z.object({
	role: z.enum(["user", "assistant"]),
	content: z.string(),
	id: z.string().optional(),
});

export const ChatRequestSchema = z.object({
	messages: z.array(MessageSchema).min(1, "messages must not be empty"),
});

export type Message = z.infer<typeof MessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
