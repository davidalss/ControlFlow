import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum('user_role', ['admin', 'inspector', 'engineering', 'manager', 'block_control']);
export const businessUnitEnum = pgEnum('business_unit', ['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT']);
export const inspectionStatusEnum = pgEnum('inspection_status', ['draft', 'pending', 'approved', 'conditionally_approved', 'rejected', 'pending_engineering_analysis']);
export const blockStatusEnum = pgEnum('block_status', ['active', 'released']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),
  businessUnit: businessUnitEnum("business_unit"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  businessUnit: businessUnitEnum("business_unit").notNull(),
  technicalParameters: jsonb("technical_parameters"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inspectionPlans = pgTable("inspection_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  version: text("version").notNull(),
  steps: jsonb("steps").notNull(),
  checklists: jsonb("checklists").notNull(),
  requiredParameters: jsonb("required_parameters").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const acceptanceRecipes = pgTable("acceptance_recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  version: text("version").notNull(),
  parameters: jsonb("parameters").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inspections = pgTable("inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inspectionId: text("inspection_id").notNull().unique(),
  inspectorId: varchar("inspector_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  planId: varchar("plan_id").notNull().references(() => inspectionPlans.id),
  recipeId: varchar("recipe_id").notNull().references(() => acceptanceRecipes.id),
  serialNumber: text("serial_number"),
  status: inspectionStatusEnum("status").default('draft').notNull(),
  technicalParameters: jsonb("technical_parameters"),
  visualChecks: jsonb("visual_checks"),
  photos: jsonb("photos"),
  videos: jsonb("videos"),
  observations: text("observations"),
  defectType: text("defect_type"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const approvalDecisions = pgTable("approval_decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inspectionId: varchar("inspection_id").notNull().references(() => inspections.id),
  engineerId: varchar("engineer_id").notNull().references(() => users.id),
  decision: text("decision").notNull(),
  justification: text("justification").notNull(),
  evidence: jsonb("evidence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blocks = pgTable("blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  responsibleUserId: varchar("responsible_user_id").notNull().references(() => users.id),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  status: blockStatusEnum("status").default('active').notNull(),
  justification: text("justification").notNull(),
  evidence: jsonb("evidence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  releasedAt: timestamp("released_at"),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  inspections: many(inspections),
  approvalDecisions: many(approvalDecisions),
  blocks: many(blocks),
  notifications: many(notifications),
}));

export const productsRelations = relations(products, ({ many }) => ({
  inspectionPlans: many(inspectionPlans),
  acceptanceRecipes: many(acceptanceRecipes),
  inspections: many(inspections),
  blocks: many(blocks),
}));

export const inspectionPlansRelations = relations(inspectionPlans, ({ one, many }) => ({
  product: one(products, {
    fields: [inspectionPlans.productId],
    references: [products.id],
  }),
  inspections: many(inspections),
}));

export const acceptanceRecipesRelations = relations(acceptanceRecipes, ({ one, many }) => ({
  product: one(products, {
    fields: [acceptanceRecipes.productId],
    references: [products.id],
  }),
  inspections: many(inspections),
}));

export const inspectionsRelations = relations(inspections, ({ one, many }) => ({
  inspector: one(users, {
    fields: [inspections.inspectorId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [inspections.productId],
    references: [products.id],
  }),
  plan: one(inspectionPlans, {
    fields: [inspections.planId],
    references: [inspectionPlans.id],
  }),
  recipe: one(acceptanceRecipes, {
    fields: [inspections.recipeId],
    references: [acceptanceRecipes.id],
  }),
  approvalDecisions: many(approvalDecisions),
}));

export const approvalDecisionsRelations = relations(approvalDecisions, ({ one }) => ({
  inspection: one(inspections, {
    fields: [approvalDecisions.inspectionId],
    references: [inspections.id],
  }),
  engineer: one(users, {
    fields: [approvalDecisions.engineerId],
    references: [users.id],
  }),
}));

export const blocksRelations = relations(blocks, ({ one }) => ({
  product: one(products, {
    fields: [blocks.productId],
    references: [products.id],
  }),
  responsibleUser: one(users, {
    fields: [blocks.responsibleUserId],
    references: [users.id],
  }),
  requester: one(users, {
    fields: [blocks.requesterId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertInspectionPlanSchema = createInsertSchema(inspectionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertAcceptanceRecipeSchema = createInsertSchema(acceptanceRecipes).omit({
  id: true,
  createdAt: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertApprovalDecisionSchema = createInsertSchema(approvalDecisions).omit({
  id: true,
  createdAt: true,
});

export const insertBlockSchema = createInsertSchema(blocks).omit({
  id: true,
  createdAt: true,
  releasedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InspectionPlan = typeof inspectionPlans.$inferSelect;
export type InsertInspectionPlan = z.infer<typeof insertInspectionPlanSchema>;
export type AcceptanceRecipe = typeof acceptanceRecipes.$inferSelect;
export type InsertAcceptanceRecipe = z.infer<typeof insertAcceptanceRecipeSchema>;
export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type ApprovalDecision = typeof approvalDecisions.$inferSelect;
export type InsertApprovalDecision = z.infer<typeof insertApprovalDecisionSchema>;
export type Block = typeof blocks.$inferSelect;
export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
