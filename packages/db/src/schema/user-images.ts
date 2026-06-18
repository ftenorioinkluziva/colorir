import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userImages = pgTable(
	"user_images",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		prompt: text("prompt").notNull(),
		estilo: text("estilo").notNull(),
		url: text("url").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("user_images_userId_idx").on(table.userId)],
);

export const userImagesRelations = relations(userImages, ({ one }) => ({
	user: one(user, {
		fields: [userImages.userId],
		references: [user.id],
	}),
}));
