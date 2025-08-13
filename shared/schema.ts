import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ['admin', 'inspector', 'engineering', 'coordenador', 'block_control', 'temporary_viewer', 'analista', 'assistente', 'lider', 'supervisor', 'p&d', 'tecnico', 'manager'] }).notNull(),
  businessUnit: text("business_unit", { enum: ['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A'] }),
  photo: text("photo"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  expiresAt: integer("expires_at", { mode: 'timestamp' }),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: integer("password_reset_expires", { mode: 'timestamp' }),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  ean: text("ean"),
  description: text("description").notNull(),
  category: text("category").notNull(),
  businessUnit: text("business_unit", { enum: ['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A'] }).notNull(),
  technicalParameters: text("technical_parameters"), // JSON as text
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Nova tabela para planos de inspeção baseada no documento PCG02.049
export const inspectionPlans = sqliteTable("inspection_plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  planCode: text("plan_code").notNull().unique(), // Ex: PCG02.049
  planName: text("plan_name").notNull(), // Ex: "Plano de Inspeção - Air Fryer Barbecue"
  planType: text("plan_type", { enum: ['product', 'parts'] }).notNull(), // produto ou peças
  version: text("version").notNull(), // Ex: "Rev. 01"
  status: text("status", { enum: ['active', 'inactive', 'draft'] }).default('draft').notNull(),
  
  // Informações do produto
  productId: text("product_id").references(() => products.id),
  productCode: text("product_code"), // Código do produto (pode ser múltiplos)
  productName: text("product_name").notNull(),
  productFamily: text("product_family"),
  businessUnit: text("business_unit", { enum: ['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A'] }).notNull(),
  
  // Tipo de inspeção
  inspectionType: text("inspection_type", { enum: ['functional', 'graphic', 'dimensional', 'electrical', 'packaging', 'mixed'] }).notNull(),
  
  // Critérios de aceite/rejeição
  aqlCritical: real("aql_critical").default(0),
  aqlMajor: real("aql_major").default(2.5),
  aqlMinor: real("aql_minor").default(4.0),
  samplingMethod: text("sampling_method").notNull(), // NBR 5426, 100%, etc.
  inspectionLevel: text("inspection_level", { enum: ['I', 'II', 'III'] }).default('II'),
  
  // Estrutura do plano
  inspectionSteps: text("inspection_steps").notNull(), // JSON com etapas detalhadas
  checklists: text("checklists").notNull(), // JSON com checklists
  requiredParameters: text("required_parameters").notNull(), // JSON com parâmetros obrigatórios
  requiredPhotos: text("required_photos"), // JSON com fotos obrigatórias
  
  // Arquivos complementares
  labelFile: text("label_file"), // URL do arquivo de etiqueta
  manualFile: text("manual_file"), // URL do manual
  packagingFile: text("packaging_file"), // URL da embalagem
  artworkFile: text("artwork_file"), // URL da arte
  additionalFiles: text("additional_files"), // JSON com outros arquivos
  
  // Controle de versão
  createdBy: text("created_by").notNull().references(() => users.id),
  approvedBy: text("approved_by").references(() => users.id),
  approvedAt: integer("approved_at", { mode: 'timestamp' }),
  
  // Metadados
  observations: text("observations"),
  specialInstructions: text("special_instructions"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Histórico de revisões do plano
export const inspectionPlanRevisions = sqliteTable("inspection_plan_revisions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  planId: text("plan_id").notNull().references(() => inspectionPlans.id),
  version: text("version").notNull(), // Ex: "Rev. 01", "Rev. 02"
  revisionNumber: integer("revision_number").notNull(), // 1, 2, 3...
  changes: text("changes").notNull(), // JSON com descrição das mudanças
  changedBy: text("changed_by").notNull().references(() => users.id),
  approvedBy: text("approved_by").references(() => users.id),
  approvedAt: integer("approved_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Vinculação de produtos ao plano (muitos para muitos)
export const inspectionPlanProducts = sqliteTable("inspection_plan_products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  planId: text("plan_id").notNull().references(() => inspectionPlans.id),
  productId: text("product_id").notNull().references(() => products.id),
  voltage: text("voltage"), // Para produtos com múltiplas voltagens
  variant: text("variant"), // Variação do produto
  isActive: integer("is_active", { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const acceptanceRecipes = sqliteTable("acceptance_recipes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id").notNull().references(() => products.id),
  version: text("version").notNull(),
  parameters: text("parameters").notNull(), // JSON as text
  isActive: integer("is_active", { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const inspections = sqliteTable("inspections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  inspectionId: text("inspection_id").notNull().unique(),
  inspectorId: text("inspector_id").notNull().references(() => users.id),
  productId: text("product_id").notNull().references(() => products.id),
  planId: text("plan_id").notNull().references(() => inspectionPlans.id),
  planVersion: text("plan_version").notNull(), // Versão do plano usada
  recipeId: text("recipe_id").notNull().references(() => acceptanceRecipes.id),
  serialNumber: text("serial_number"),
  status: text("status", { enum: ['draft', 'pending', 'approved', 'conditionally_approved', 'rejected', 'pending_engineering_analysis'] }).default('draft').notNull(),
  technicalParameters: text("technical_parameters"), // JSON as text
  visualChecks: text("visual_checks"), // JSON as text
  photos: text("photos"), // JSON as text
  videos: text("videos"), // JSON as text
  observations: text("observations"),
  defectType: text("defect_type"),
  startedAt: integer("started_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: 'timestamp' }),
});

export const approvalDecisions = sqliteTable("approval_decisions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  inspectionId: text("inspection_id").notNull().references(() => inspections.id),
  engineerId: text("engineer_id").notNull().references(() => users.id),
  decision: text("decision").notNull(),
  justification: text("justification").notNull(),
  evidence: text("evidence"), // JSON as text
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const blocks = sqliteTable("blocks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  responsibleUserId: text("responsible_user_id").notNull().references(() => users.id),
  requesterId: text("requester_id").notNull().references(() => users.id),
  status: text("status", { enum: ['active', 'released'] }).default('active').notNull(),
  justification: text("justification").notNull(),
  evidence: text("evidence"), // JSON as text
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  releasedAt: integer("released_at", { mode: 'timestamp' }),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isRead: integer("is_read", { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// New tables for enhanced user management
export const groups = sqliteTable("groups", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  businessUnit: text("business_unit", { enum: ['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A'] }),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const groupMembers = sqliteTable("group_members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId: text("group_id").notNull().references(() => groups.id),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role", { enum: ['member', 'leader', 'admin'] }).default('member').notNull(),
  joinedAt: integer("joined_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const permissions = sqliteTable("permissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description"),
  resource: text("resource").notNull(), // e.g., 'users', 'products', 'inspections'
  action: text("action").notNull(), // e.g., 'create', 'read', 'update', 'delete'
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const rolePermissions = sqliteTable("role_permissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  role: text("role").notNull(),
  permissionId: text("permission_id").notNull().references(() => permissions.id),
  granted: integer("granted", { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const solicitations = sqliteTable("solicitations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type", { enum: ['inspection', 'approval', 'block', 'analysis', 'general'] }).notNull(),
  priority: text("priority", { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium').notNull(),
  status: text("status", { enum: ['pending', 'in_progress', 'completed', 'cancelled'] }).default('pending').notNull(),
  createdBy: text("created_by").notNull().references(() => users.id),
  assignedTo: text("assigned_to").references(() => users.id), // null for group assignments
  assignedGroup: text("assigned_group").references(() => groups.id), // null for individual assignments
  productId: text("product_id").references(() => products.id),
  dueDate: integer("due_date", { mode: 'timestamp' }),
  startedAt: integer("started_at", { mode: 'timestamp' }),
  completedAt: integer("completed_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const solicitationAssignments = sqliteTable("solicitation_assignments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  solicitationId: text("solicitation_id").notNull().references(() => solicitations.id),
  userId: text("user_id").notNull().references(() => users.id),
  status: text("status", { enum: ['pending', 'accepted', 'declined', 'completed'] }).default('pending').notNull(),
  acceptedAt: integer("accepted_at", { mode: 'timestamp' }),
  completedAt: integer("completed_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const logs = sqliteTable("logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  timestamp: integer("timestamp", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  userId: text("user_id").references(() => users.id),
  userName: text("user_name").notNull(),
  actionType: text("action_type").notNull(),
  description: text("description").notNull(),
  details: text("details"), // JSON as text
});

// Relations

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

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  timestamp: true,
});

export const insertSolicitationSchema = createInsertSchema(solicitations).omit({
  id: true,
  createdAt: true,
});

// New insert schemas
export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertSolicitationAssignmentSchema = createInsertSchema(solicitationAssignments).omit({
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
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type Solicitation = typeof solicitations.$inferSelect;
export type InsertSolicitation = z.infer<typeof insertSolicitationSchema>;

// New types
export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type SolicitationAssignment = typeof solicitationAssignments.$inferSelect;
export type InsertSolicitationAssignment = z.infer<typeof insertSolicitationAssignmentSchema>;
