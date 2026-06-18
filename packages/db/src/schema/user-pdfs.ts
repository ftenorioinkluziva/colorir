import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userPdfs = pgTable(
	"user_pdfs",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		url: text("url").notNull(),
		imageCount: integer("image_count").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("user_pdfs_userId_idx").on(table.userId)],
);

export const userPdfsRelations = relations(userPdfs, ({ one }) => ({
	user: one(user, {
		fields: [userPdfs.userId],
		references: [user.id],
	}),
}));
