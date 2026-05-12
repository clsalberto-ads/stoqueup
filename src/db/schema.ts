import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	role: text("role"),
	banned: boolean("banned"),
	impersonatedBy: text("impersonatedBy"),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt"),
	updatedAt: timestamp("updatedAt"),
});

export const products = pgTable("products", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	price: integer("price").notNull(), // em centavos
	imageUrl: text("imageUrl"),
	qtdMinima: integer("qtdMinima").notNull().default(0),
	qtdMaxima: integer("qtdMaxima").notNull().default(0),
	minParaVenda: integer("minParaVenda").notNull().default(0),
	currentStock: integer("currentStock").notNull().default(0),
	statusVenda: boolean("statusVenda").notNull().default(true),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});

export const inventoryLogs = pgTable("inventory_logs", {
	id: text("id").primaryKey(),
	productId: text("productId")
		.notNull()
		.references(() => products.id),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	change: integer("change").notNull(),
	type: text("type").notNull(), // SALE, PRODUCTION, ADJUSTMENT
	createdAt: timestamp("createdAt").notNull(),
});

export const productionTasks = pgTable("production_tasks", {
	id: text("id").primaryKey(),
	productId: text("productId")
		.notNull()
		.references(() => products.id),
	status: text("status").notNull().default("PENDING"), // PENDING, IN_PROGRESS, COMPLETED
	quantity: integer("quantity").notNull().default(0),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});

export const notifications = pgTable("notifications", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	title: text("title").notNull(),
	content: text("content").notNull(),
	isRead: boolean("isRead").default(false).notNull(),
	createdAt: timestamp("createdAt").notNull(),
});

export const organization = pgTable("organization", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").unique(),
	logo: text("logo"),
	createdAt: timestamp("createdAt").notNull(),
	metadata: text("metadata"),
});

export const member = pgTable("member", {
	id: text("id").primaryKey(),
	organizationId: text("organizationId")
		.notNull()
		.references(() => organization.id),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	role: text("role").notNull(),
	createdAt: timestamp("createdAt").notNull(),
});

export const invitation = pgTable("invitation", {
	id: text("id").primaryKey(),
	organizationId: text("organizationId")
		.notNull()
		.references(() => organization.id),
	email: text("email").notNull(),
	role: text("role"),
	status: text("status").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	inviterId: text("inviterId")
		.notNull()
		.references(() => user.id),
});
