import { 
  users, products, inspectionPlans, acceptanceRecipes, 
  inspections, approvalDecisions, blocks, notifications,
  type User, type InsertUser, type Product, type InsertProduct,
  type InspectionPlan, type InsertInspectionPlan,
  type AcceptanceRecipe, type InsertAcceptanceRecipe,
  type Inspection, type InsertInspection,
  type ApprovalDecision, type InsertApprovalDecision,
  type Block, type InsertBlock,
  type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByCode(code: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Inspection Plans
  getInspectionPlans(productId?: string): Promise<InspectionPlan[]>;
  getActiveInspectionPlan(productId: string): Promise<InspectionPlan | undefined>;
  createInspectionPlan(plan: InsertInspectionPlan): Promise<InspectionPlan>;

  // Acceptance Recipes
  getAcceptanceRecipes(productId?: string): Promise<AcceptanceRecipe[]>;
  getActiveAcceptanceRecipe(productId: string): Promise<AcceptanceRecipe | undefined>;
  createAcceptanceRecipe(recipe: InsertAcceptanceRecipe): Promise<AcceptanceRecipe>;

  // Inspections
  getInspections(inspectorId?: string): Promise<Inspection[]>;
  getInspection(id: string): Promise<Inspection | undefined>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: string, inspection: Partial<Inspection>): Promise<Inspection>;
  getPendingApprovals(): Promise<Inspection[]>;

  // Approval Decisions
  createApprovalDecision(decision: InsertApprovalDecision): Promise<ApprovalDecision>;

  // Blocks
  getBlocks(): Promise<Block[]>;
  createBlock(block: InsertBlock): Promise<Block>;
  updateBlock(id: string, block: Partial<Block>): Promise<Block>;

  // Notifications
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;

  // Dashboard metrics
  getDashboardMetrics(userId?: string): Promise<{
    inspectionsToday: number;
    approvalRate: number;
    pendingApprovals: number;
    blockedItems: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductByCode(code: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.code, code));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async getInspectionPlans(productId?: string): Promise<InspectionPlan[]> {
    const query = db.select().from(inspectionPlans);
    if (productId) {
      return await query.where(eq(inspectionPlans.productId, productId));
    }
    return await query;
  }

  async getActiveInspectionPlan(productId: string): Promise<InspectionPlan | undefined> {
    const [plan] = await db.select().from(inspectionPlans)
      .where(and(eq(inspectionPlans.productId, productId), eq(inspectionPlans.isActive, true)));
    return plan || undefined;
  }

  async createInspectionPlan(insertPlan: InsertInspectionPlan): Promise<InspectionPlan> {
    const [plan] = await db.insert(inspectionPlans).values(insertPlan).returning();
    return plan;
  }

  async getAcceptanceRecipes(productId?: string): Promise<AcceptanceRecipe[]> {
    const query = db.select().from(acceptanceRecipes);
    if (productId) {
      return await query.where(eq(acceptanceRecipes.productId, productId));
    }
    return await query;
  }

  async getActiveAcceptanceRecipe(productId: string): Promise<AcceptanceRecipe | undefined> {
    const [recipe] = await db.select().from(acceptanceRecipes)
      .where(and(eq(acceptanceRecipes.productId, productId), eq(acceptanceRecipes.isActive, true)));
    return recipe || undefined;
  }

  async createAcceptanceRecipe(insertRecipe: InsertAcceptanceRecipe): Promise<AcceptanceRecipe> {
    const [recipe] = await db.insert(acceptanceRecipes).values(insertRecipe).returning();
    return recipe;
  }

  async getInspections(inspectorId?: string): Promise<Inspection[]> {
    const query = db.select().from(inspections).orderBy(desc(inspections.startedAt));
    if (inspectorId) {
      return await query.where(eq(inspections.inspectorId, inspectorId));
    }
    return await query;
  }

  async getInspection(id: string): Promise<Inspection | undefined> {
    const [inspection] = await db.select().from(inspections).where(eq(inspections.id, id));
    return inspection || undefined;
  }

  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    const [inspection] = await db.insert(inspections).values(insertInspection).returning();
    return inspection;
  }

  async updateInspection(id: string, updateData: Partial<Inspection>): Promise<Inspection> {
    const [inspection] = await db.update(inspections)
      .set(updateData)
      .where(eq(inspections.id, id))
      .returning();
    return inspection;
  }

  async getPendingApprovals(): Promise<Inspection[]> {
    return await db.select().from(inspections)
      .where(eq(inspections.status, 'pending'))
      .orderBy(desc(inspections.startedAt));
  }

  async createApprovalDecision(insertDecision: InsertApprovalDecision): Promise<ApprovalDecision> {
    const [decision] = await db.insert(approvalDecisions).values(insertDecision).returning();
    return decision;
  }

  async getBlocks(): Promise<Block[]> {
    return await db.select().from(blocks).orderBy(desc(blocks.createdAt));
  }

  async createBlock(insertBlock: InsertBlock): Promise<Block> {
    const [block] = await db.insert(blocks).values(insertBlock).returning();
    return block;
  }

  async updateBlock(id: string, updateData: Partial<Block>): Promise<Block> {
    const [block] = await db.update(blocks)
      .set(updateData)
      .where(eq(blocks.id, id))
      .returning();
    return block;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async getDashboardMetrics(userId?: string): Promise<{
    inspectionsToday: number;
    approvalRate: number;
    pendingApprovals: number;
    blockedItems: number;
  }> {
    // For now, return sample metrics - in production these would be calculated from actual data
    const today = new Date().toISOString().split('T')[0];
    const inspectionsToday = await db.select().from(inspections).where(
      sql`DATE(${inspections.startedAt}) = ${today}`
    );
    
    const pendingApprovals = await db.select().from(inspections).where(
      eq(inspections.status, 'pending')
    );

    const activeBlocks = await db.select().from(blocks).where(
      eq(blocks.status, 'active')
    );

    return {
      inspectionsToday: inspectionsToday.length,
      approvalRate: 92.5, // This would be calculated from approved vs total inspections
      pendingApprovals: pendingApprovals.length,
      blockedItems: activeBlocks.length,
    };
  }
}

export const storage = new DatabaseStorage();
