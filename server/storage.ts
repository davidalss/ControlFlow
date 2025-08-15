import { 
  users, products, inspectionPlans, acceptanceRecipes, 
  inspections, approvalDecisions, blocks, notifications, logs,
  solicitations, InsertSolicitation, Solicitation,
  type User, type InsertUser, type Product, type InsertProduct,
  type InspectionPlan, type InsertInspectionPlan,
  type AcceptanceRecipe, type InsertAcceptanceRecipe,
  type Inspection, type InsertInspection,
  type ApprovalDecision, type InsertApprovalDecision,
  type Block, type InsertBlock,
  type Notification, type InsertNotification,
  type Log, type InsertLog
} from "../shared/schema";
import { db } from "./db";
import { eq, and, isNull, gte, lt, sql, or, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { hashPassword } from "./middleware/auth";
import { addHours } from "date-fns";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserEmail(id: string, newEmail: string): Promise<User>;
  updateUserProfile(id: string, profileData: { name?: string; businessUnit?: string }): Promise<User>;
  updateUserPhoto(id: string, photoUrl: string): Promise<User>;
  setUserPasswordResetToken(email: string, token: string, expires: Date): Promise<void>;
  findUserByResetToken(token: string): Promise<User | undefined>;
  updateUserPassword(id: string, newPasswordHash: string): Promise<User>;
  deleteUser(id: string): Promise<void>;
  ensureAdminUserExists(): Promise<void>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByCode(code: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updateData: Partial<Product>): Promise<Product>;
  
  // Inspection Plans
  getInspectionPlans(productId?: string): Promise<InspectionPlan[]>;
  getInspectionPlansByProduct(productId: string): Promise<InspectionPlan[]>;
  getActiveInspectionPlan(productId: string): Promise<InspectionPlan | undefined>;
  createInspectionPlan(plan: InsertInspectionPlan): Promise<InspectionPlan>;
  updateInspectionPlan(id: string, updateData: Partial<InspectionPlan>): Promise<InspectionPlan>;
  
  // Acceptance Recipes
  getAcceptanceRecipes(productId?: string): Promise<AcceptanceRecipe[]>;
  getActiveAcceptanceRecipe(productId: string): Promise<AcceptanceRecipe | undefined>;
  createAcceptanceRecipe(recipe: InsertAcceptanceRecipe): Promise<AcceptanceRecipe>;
  
  // Inspections
  getInspections(inspectorId?: string): Promise<Inspection[]>;
  getInspectionsByProduct(productId: string): Promise<Inspection[]>;
  getInspection(id: string): Promise<Inspection | undefined>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: string, inspection: Partial<Inspection>): Promise<Inspection>;
  getPendingApprovals(): Promise<Inspection[]>;
  
  // Approval Decisions
  createApprovalDecision(decision: InsertApprovalDecision): Promise<ApprovalDecision>;
  
  // Blocks
  getBlocks(): Promise<Block[]>;
  getBlocksByProduct(productId: string): Promise<Block[]>;
  createBlock(block: InsertBlock): Promise<Block>;
  updateBlock(id: string, block: Partial<Block>): Promise<Block>;
  
  // Notifications
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  
  // Logs
  logAction(log: InsertLog): Promise<void>;
  getLogs(): Promise<Log[]>;
  
  // Dashboard metrics
  getDashboardMetrics(userId?: string): Promise<{
    inspectionsToday: number;
    approvalRate: number;
    pendingApprovals: number;
    blockedItems: number;
  }>;
  
  // Solicitations
  createSolicitation(solicitation: InsertSolicitation): Promise<Solicitation>;
  getPendingSolicitations(): Promise<Solicitation[]>;
  getSolicitation(id: string): Promise<Solicitation | undefined>;
  updateSolicitation(id: string, data: Partial<InsertSolicitation>): Promise<Solicitation>;
}

export class DatabaseStorage implements IStorage {
  private db: NodePgDatabase;

  constructor(database: NodePgDatabase = db) {
    this.db = database;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }
  
  async getUsers(): Promise<User[]> {
    return await this.db.select().from(users);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await this.db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return user;
  }
  
  async updateUserEmail(id: string, newEmail: string): Promise<User> {
    const [user] = await this.db.update(users).set({ email: newEmail }).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserProfile(id: string, profileData: { name?: string; businessUnit?: string }): Promise<User> {
    const updateData: any = {};
    if (profileData.name) updateData.name = profileData.name;
    if (profileData.businessUnit) updateData.businessUnit = profileData.businessUnit;
    
    const [user] = await this.db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserPhoto(id: string, photoUrl: string): Promise<User> {
    const [user] = await this.db.update(users).set({ photo: photoUrl }).where(eq(users.id, id)).returning();
    return user;
  }
  
  async setUserPasswordResetToken(email: string, token: string, expires: Date): Promise<void> {
    await this.db.update(users)
      .set({ passwordResetToken: token, passwordResetExpires: expires })
      .where(eq(users.email, email));
  }
  
  async findUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(
      and(
        eq(users.passwordResetToken, token),
        gte(users.passwordResetExpires, new Date())
      )
    );
    return user || undefined;
  }
  
  async updateUserPassword(id: string, newPasswordHash: string): Promise<User> {
    const [user] = await this.db.update(users)
      .set({ 
        password: newPasswordHash, 
        passwordResetToken: null,
        passwordResetExpires: null
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async deleteUser(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
  
  async ensureAdminUserExists(): Promise<void> {
    const adminEmail = 'admin@controlflow.com';
    const existingAdmin = await this.getUserByEmail(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = await hashPassword('admin123');
      await this.createUser({
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      });
      console.log(`Default admin user created. Email: ${adminEmail}, Password: admin123`);
    } else {
      console.log(`Admin user already exists. Email: ${adminEmail}`);
    }

    // Create demo users
    await this.ensureDemoUsers();
  }

  async ensureDemoUsers(): Promise<void> {
    const demoUsers = [
      {
        email: 'inspector@controlflow.com',
        password: 'inspector123',
        name: 'Inspector Demo',
        role: 'inspector'
      },
      {
        email: 'engineering@controlflow.com',
        password: 'engineering123',
        name: 'Engineering Demo',
        role: 'engineering'
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await this.getUserByEmail(userData.email);
      if (!existingUser) {
        const hashedPassword = await hashPassword(userData.password);
        await this.createUser({
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
        });
        console.log(`Demo user created. Email: ${userData.email}, Password: ${userData.password}`);
      }
    }
  }
  
  async getProducts(): Promise<Product[]> {
    const productsData = await this.db.select().from(products);
    return productsData.map(product => ({
      ...product,
      technicalParameters: product.technicalParameters ? JSON.parse(product.technicalParameters) : null
    }));
  }
  
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await this.db.select().from(products).where(eq(products.id, id));
    if (!product) return undefined;
    return {
      ...product,
      technicalParameters: product.technicalParameters ? JSON.parse(product.technicalParameters) : null
    };
  }
  
  async getProductByCode(code: string): Promise<Product | undefined> {
    const [product] = await this.db.select().from(products).where(eq(products.code, code));
    if (!product) return undefined;
    return {
      ...product,
      technicalParameters: product.technicalParameters ? JSON.parse(product.technicalParameters) : null
    };
  }
  
  // Helper function to map category to business unit
  private mapCategoryToBusinessUnit(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'Ar e Climatização': 'MOTOR_COMFORT',
      'Cozinha': 'KITCHEN_BEAUTY',
      'Robô Aspirador': 'TECH',
      'Limpeza': 'N/A',
      'Ferramentas': 'DIY',
      'Jardinagem': 'DIY',
      'Áudio e Vídeo': 'TECH',
      'Eletroportáteis': 'KITCHEN_BEAUTY',
      'Vaporizadores': 'TECH',
      'Outros': 'N/A',
      // Categorias específicas encontradas
      'ferramenta - paraffuradmart': 'DIY',
      'ferramenta - pinturasoprador': 'DIY',
      'ferramenta - serralixadesbas': 'DIY',
      'jardinagem eltrica': 'DIY',
      'garden manual - pulverizao': 'DIY',
      'garden manual - irrigao': 'DIY',
      'aspirador - porttil': 'TECH',
      'lavadoras agua fria comercial': 'N/A',
      'cmeras': 'TECH',
      'polidora': 'DIY',
      'umidificadorar condicionado': 'MOTOR_COMFORT',
      'extrator - porttil': 'TECH',
      'aspirador - sem fio': 'TECH',
      'extratora - vertical': 'TECH',
      '': 'N/A' // Categorias vazias
    };
    
    return categoryMap[category] || 'N/A';
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    // Convert technicalParameters to JSON string if it exists
    const processedData = { ...insertProduct };
    if (processedData.technicalParameters) {
      processedData.technicalParameters = JSON.stringify(processedData.technicalParameters);
    }
    
    // Auto-assign business unit based on category if not provided
    if (!processedData.businessUnit || processedData.businessUnit === 'N/A') {
      processedData.businessUnit = this.mapCategoryToBusinessUnit(processedData.category);
    }
    
    const [product] = await this.db.insert(products).values(processedData).returning();
    
    // Parse technicalParameters back to object
    return {
      ...product,
      technicalParameters: product.technicalParameters ? JSON.parse(product.technicalParameters) : null
    };
  }
  
  async updateProduct(id: string, updateData: Partial<Product>): Promise<Product> {
    try {
      // Convert technicalParameters to JSON string if it exists
      const processedData = { ...updateData };
      if (processedData.technicalParameters && typeof processedData.technicalParameters === 'object') {
        processedData.technicalParameters = JSON.stringify(processedData.technicalParameters);
      }
      
      const [product] = await this.db.update(products)
        .set(processedData)
        .where(eq(products.id, id))
        .returning();
      
      if (!product) {
        throw new Error('Produto não encontrado');
      }
      
      // Parse technicalParameters back to object
      return {
        ...product,
        technicalParameters: product.technicalParameters ? JSON.parse(product.technicalParameters) : null
      };
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<Product | undefined> {
    try {
      // First get the product to return it
      const [existingProduct] = await this.db.select().from(products).where(eq(products.id, id));
      if (!existingProduct) {
        return undefined;
      }
      
      // Delete the product
      await this.db.delete(products).where(eq(products.id, id));
      
      // Return the deleted product with parsed technicalParameters
      return {
        ...existingProduct,
        technicalParameters: existingProduct.technicalParameters ? JSON.parse(existingProduct.technicalParameters) : null
      };
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      throw error;
    }
  }
  
  async getInspectionPlans(productId?: string): Promise<InspectionPlan[]> {
    const query = this.db.select().from(inspectionPlans);
    if (productId) {
      return await query.where(eq(inspectionPlans.productId, productId));
    }
    return await query;
  }
  
  async getActiveInspectionPlan(productId: string): Promise<InspectionPlan | undefined> {
    const [plan] = await this.db.select().from(inspectionPlans)
      .where(and(eq(inspectionPlans.productId, productId), eq(inspectionPlans.isActive, true)));
    return plan || undefined;
  }
  
  async createInspectionPlan(insertPlan: InsertInspectionPlan): Promise<InspectionPlan> {
    const [plan] = await this.db.insert(inspectionPlans).values(insertPlan).returning();
    return plan;
  }
  
  async updateInspectionPlan(id: string, updateData: Partial<InspectionPlan>): Promise<InspectionPlan> {
    const [plan] = await this.db.update(inspectionPlans)
      .set(updateData)
      .where(eq(inspectionPlans.id, id))
      .returning();
    return plan;
  }

  async deleteInspectionPlan(id: string): Promise<void> {
    await this.db.delete(inspectionPlans).where(eq(inspectionPlans.id, id));
  }
  
  async getAcceptanceRecipes(productId?: string): Promise<AcceptanceRecipe[]> {
    const query = this.db.select().from(acceptanceRecipes);
    if (productId) {
      return await query.where(eq(acceptanceRecipes.productId, productId));
    }
    return await query;
  }
  
  async getActiveAcceptanceRecipe(productId: string): Promise<AcceptanceRecipe | undefined> {
    const [recipe] = await this.db.select().from(acceptanceRecipes)
      .where(and(eq(acceptanceRecipes.productId, productId), eq(acceptanceRecipes.isActive, true)));
    return recipe || undefined;
  }
  
  async createAcceptanceRecipe(insertRecipe: InsertAcceptanceRecipe): Promise<AcceptanceRecipe> {
    const [recipe] = await this.db.insert(acceptanceRecipes).values(insertRecipe).returning();
    return recipe;
  }
  
  async getInspections(inspectorId?: string): Promise<Inspection[]> {
    if (inspectorId) {
      return await this.db.query.inspections.findMany({
        where: eq(inspections.inspectorId, inspectorId),
        with: {
          inspector: true,
          product: true,
          approvalDecisions: {
            with: {
              engineer: true,
            },
          },
        },
        orderBy: desc(inspections.startedAt),
      });
    }
    return await this.db.query.inspections.findMany({
      with: {
        inspector: true,
        product: true,
        approvalDecisions: {
          with: {
            engineer: true,
          },
        },
      },
      orderBy: desc(inspections.startedAt),
    });
  }
  
  async getInspection(id: string): Promise<Inspection | undefined> {
    const inspection = await this.db.query.inspections.findFirst({
      where: eq(inspections.id, id),
      with: {
        inspector: true,
        product: true,
        plan: true,
        recipe: true,
        approvalDecisions: {
          with: {
            engineer: true,
          },
        },
      },
    });
    return inspection || undefined;
  }
  
  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    const [inspection] = await this.db.insert(inspections).values(insertInspection).returning();
    return inspection;
  }
  
  async updateInspection(id: string, updateData: Partial<Inspection>): Promise<Inspection> {
    const [inspection] = await this.db.update(inspections)
      .set(updateData)
      .where(eq(inspections.id, id))
      .returning();
    return inspection;
  }
  
  async getPendingApprovals(): Promise<Inspection[]> {
    return await this.db.query.inspections.findMany({
      where: or(
        eq(inspections.status, 'pending'),
        eq(inspections.status, 'pending_engineering_analysis')
      ),
      with: {
        product: true,
        inspector: true,
        recipe: true,
        approvalDecisions: {
          with: {
            engineer: true,
          },
        },
      },
      orderBy: desc(inspections.startedAt),
    });
  }
  
  async createApprovalDecision(insertDecision: InsertApprovalDecision): Promise<ApprovalDecision> {
    const [decision] = await this.db.insert(approvalDecisions).values(insertDecision).returning();
    return decision;
  }
  
  async getBlocks(): Promise<Block[]> {
    return await this.db.select().from(blocks).orderBy(desc(blocks.createdAt));
  }
  
  async createBlock(insertBlock: InsertBlock): Promise<Block> {
    const [block] = await this.db.insert(blocks).values(insertBlock).returning();
    return block;
  }
  
  async updateBlock(id: string, updateData: Partial<Block>): Promise<Block> {
    const [block] = await this.db.update(blocks)
      .set(updateData)
      .where(eq(blocks.id, id))
      .returning();
    return block;
  }
  
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await this.db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await this.db.insert(notifications).values(insertNotification).returning();
    return notification;
  }
  
  async markNotificationRead(id: string): Promise<void> {
    await this.db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }
  
  async logAction(insertLog: InsertLog): Promise<void> {
    const normalizedDetails =
      (insertLog as any).details === undefined || (insertLog as any).details === null
        ? undefined
        : typeof (insertLog as any).details === 'string'
          ? (insertLog as any).details
          : JSON.stringify((insertLog as any).details);

    const logRecord: any = {
      ...insertLog,
      ...(normalizedDetails !== undefined ? { details: normalizedDetails } : {}),
    };

    await this.db.insert(logs).values(logRecord);
  }
  
  async getLogs(): Promise<Log[]> {
    return await this.db.select().from(logs).orderBy(desc(logs.timestamp));
  }
  
  // Solicitation functions
  async createSolicitation(solicitation: InsertSolicitation): Promise<Solicitation> {
    const [newSolicitation] = await this.db.insert(solicitations).values(solicitation).returning();
    return newSolicitation;
  }
  
  async getPendingSolicitations(): Promise<Solicitation[]> {
    return this.db.query.solicitations.findMany({
      where: eq(solicitations.status, 'pending'),
      orderBy: (solicitations, { asc }) => [asc(solicitations.createdAt)],
      with: { requester: true },
    });
  }
  
  async getSolicitation(id: string): Promise<Solicitation | undefined> {
    return this.db.query.solicitations.findFirst({
      where: eq(solicitations.id, id),
      with: { requester: true, inspector: true },
    });
  }
  
  async updateSolicitation(id: string, data: Partial<InsertSolicitation>): Promise<Solicitation> {
    const [updatedSolicitation] = await this.db.update(solicitations).set({ ...data, updatedAt: new Date() }).where(eq(solicitations.id, id)).returning();
    return updatedSolicitation;
  }
  
  async getDashboardMetrics(userId?: string): Promise<{
    inspectionsToday: number;
    approvalRate: number;
    pendingApprovals: number;
    blockedItems: number;
  }> {
    // For now, return sample metrics - in production these would be calculated from actual data
    const today = new Date().toISOString().split('T')[0];
    const inspectionsToday = await this.db.select({ count: sql`count(*)` }).from(inspections).where(
      sql`DATE(${inspections.startedAt}) = ${today}`
    );
    
    const pendingApprovals = await this.db.select({ count: sql`count(*)` }).from(inspections).where(
      eq(inspections.status, 'pending')
    );
    const activeBlocks = await this.db.select({ count: sql`count(*)` }).from(blocks).where(
      eq(blocks.status, 'active')
    );
    return {
      inspectionsToday: Number(inspectionsToday[0].count),
      approvalRate: 92.5, // This would be calculated from approved vs total inspections
      pendingApprovals: Number(pendingApprovals[0].count),
      blockedItems: Number(activeBlocks[0].count),
    };
  }

  // Métodos para dados relacionados de produtos
  async getInspectionPlansByProduct(productId: string): Promise<InspectionPlan[]> {
    try {
      const plans = await this.db.select().from(inspectionPlans).where(eq(inspectionPlans.productId, productId));
      return plans;
    } catch (error) {
      console.error('Erro ao buscar planos de inspeção por produto:', error);
      return [];
    }
  }

  async getInspectionsByProduct(productId: string): Promise<Inspection[]> {
    try {
      const inspections = await this.db.select().from(inspections).where(eq(inspections.productId, productId));
      return inspections;
    } catch (error) {
      console.error('Erro ao buscar inspeções por produto:', error);
      return [];
    }
  }

  async getBlocksByProduct(productId: string): Promise<Block[]> {
    try {
      const blocks = await this.db.select().from(blocks).where(eq(blocks.productId, productId));
      return blocks;
    } catch (error) {
      console.error('Erro ao buscar bloqueios por produto:', error);
      return [];
    }
  }

  // Seed function to create example users
  async seed() {
    console.log("Seeding database with example users...");

    const usersToCreate = [
      { id: "admin-user-id", name: "Admin User", email: "admin@example.com", role: "admin" },
      { id: "inspector-user-id", name: "Inspector User", email: "inspector@example.com", role: "inspector" },
      { id: "engineering-user-id", name: "Engineering User", email: "engineering@example.com", role: "engineering" },
      { id: "manager-user-id", name: "Manager User", email: "manager@example.com", role: "manager" },
      { id: "block-control-user-id", name: "Block Control User", email: "block_control@example.com", role: "block_control" },
      { id: "temporary-viewer-user-id", name: "Temporary Viewer User", email: "viewer@example.com", role: "temporary_viewer", expiresIn: addHours(new Date(), 24) },
      { id: "tecnico-user-id", name: "Tecnico User", email: "tecnico@example.com", role: "tecnico" },
      { id: "analista-user-id", name: "Analista User", email: "analista@example.com", role: "analista" },
      { id: "lider-user-id", name: "Lider User", email: "lider@example.com", role: "lider" },
      { id: "supervisor-user-id", name: "Supervisor User", email: "supervisor@example.com", role: "supervisor" },
      { id: "coordenador-user-id", name: "Coordenador User", email: "coordenador@example.com", role: "coordenador" },
    ];

    for (const userData of usersToCreate) {
      const existingUser = await this.getUserByEmail(userData.email);
      if (!existingUser) {
        await this.createUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          password: await hashPassword("password"), // All seeded users will have 'password' as their password
          role: userData.role,
          expiresAt: userData.expiresIn,
        });
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log("Database seeding completed!");
  }
}

export const storage = new DatabaseStorage();