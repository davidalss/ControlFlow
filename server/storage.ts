import { supabase } from './db';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'inspector' | 'viewer';
  businessUnit: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'inspector' | 'viewer';
  businessUnit: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  supplierId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertProduct {
  name: string;
  description: string;
  category: string;
  sku: string;
  supplierId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
    id: string;
    name: string;
    email: string;
  phone: string;
  address: string;
  contactPerson: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertSupplier {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionPlan {
  id: string;
  name: string;
  description: string;
  productId: string;
  steps: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertInspectionPlan {
  name: string;
  description: string;
  productId: string;
  steps: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Inspection {
  id: string;
  planId: string;
  productId: string;
  inspectorId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results: any[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertInspection {
  planId: string;
  productId: string;
  inspectorId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results: any[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export class DatabaseStorage {
  private db = supabase;

  // User methods
  async getUserById(id: string): Promise<User | undefined> {
    try {
      const { data: user, error } = await this.db
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar usuário por ID:', error);
        return undefined;
      }

      return user;
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const { data: user, error } = await this.db
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Erro ao buscar usuário por email:', error);
        return undefined;
      }

      return user;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return undefined;
    }
  }
  
  async getUsers(): Promise<User[]> {
    try {
      const { data: users, error } = await this.db
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
      }

      return users || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const { data: user, error } = await this.db
        .from('users')
        .insert([insertUser])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar usuário: ${error.message}`);
      }

    return user;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }
  
  async updateUserRole(id: string, role: string): Promise<User> {
    try {
      const { data: user, error } = await this.db
        .from('users')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar role do usuário: ${error.message}`);
      }

    return user;
    } catch (error) {
      console.error('Erro ao atualizar role do usuário:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const { data: user, error } = await this.db
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar usuário: ${error.message}`);
      }

    return user;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }
  
  async deleteUser(id: string): Promise<void> {
    try {
      const { error } = await this.db
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao deletar usuário: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    try {
      const { data: products, error } = await this.db
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }

      return products || [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      const { data: product, error } = await this.db
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar produto por ID:', error);
        return undefined;
      }

      return product;
    } catch (error) {
      console.error('Erro ao buscar produto por ID:', error);
      return undefined;
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    try {
      const { data: product, error } = await this.db
        .from('products')
        .insert([insertProduct])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar produto: ${error.message}`);
      }

      return product;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const { data: product, error } = await this.db
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar produto: ${error.message}`);
      }

      return product;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await this.db
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao deletar produto: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }
  
  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const { data: suppliers, error } = await this.db
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar fornecedores:', error);
        return [];
      }

      return suppliers || [];
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return [];
    }
  }

  async getSupplierById(id: string): Promise<Supplier | undefined> {
    try {
      const { data: supplier, error } = await this.db
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar fornecedor por ID:', error);
        return undefined;
      }

      return supplier;
    } catch (error) {
      console.error('Erro ao buscar fornecedor por ID:', error);
      return undefined;
    }
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    try {
      const { data: supplier, error } = await this.db
        .from('suppliers')
        .insert([insertSupplier])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar fornecedor: ${error.message}`);
      }

      return supplier;
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      throw error;
    }
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    try {
      const { data: supplier, error } = await this.db
        .from('suppliers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar fornecedor: ${error.message}`);
      }

      return supplier;
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      throw error;
    }
  }

  async deleteSupplier(id: string): Promise<void> {
    try {
      const { error } = await this.db
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao deletar fornecedor: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao deletar fornecedor:', error);
      throw error;
    }
  }

  // Inspection Plan methods
  async getInspectionPlans(): Promise<InspectionPlan[]> {
    try {
      const { data: plans, error } = await this.db
        .from('inspection_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar planos de inspeção:', error);
        return [];
      }

      return plans || [];
    } catch (error) {
      console.error('Erro ao buscar planos de inspeção:', error);
      return [];
    }
  }

  async getInspectionPlanById(id: string): Promise<InspectionPlan | undefined> {
    try {
      const { data: plan, error } = await this.db
        .from('inspection_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar plano de inspeção por ID:', error);
        return undefined;
      }

      return plan;
    } catch (error) {
      console.error('Erro ao buscar plano de inspeção por ID:', error);
      return undefined;
    }
  }

  async createInspectionPlan(insertPlan: InsertInspectionPlan): Promise<InspectionPlan> {
    try {
      const { data: plan, error } = await this.db
        .from('inspection_plans')
        .insert([insertPlan])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar plano de inspeção: ${error.message}`);
      }

      return plan;
    } catch (error) {
      console.error('Erro ao criar plano de inspeção:', error);
      throw error;
    }
  }

  async updateInspectionPlan(id: string, updates: Partial<InspectionPlan>): Promise<InspectionPlan> {
    try {
      const { data: plan, error } = await this.db
        .from('inspection_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar plano de inspeção: ${error.message}`);
      }

      return plan;
    } catch (error) {
      console.error('Erro ao atualizar plano de inspeção:', error);
      throw error;
    }
  }

  async deleteInspectionPlan(id: string): Promise<void> {
    try {
      const { error } = await this.db
        .from('inspection_plans')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao deletar plano de inspeção: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao deletar plano de inspeção:', error);
      throw error;
    }
  }

  // Inspection methods
  async getInspections(): Promise<Inspection[]> {
    try {
      const { data: inspections, error } = await this.db
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar inspeções:', error);
        return [];
      }

      return inspections || [];
    } catch (error) {
      console.error('Erro ao buscar inspeções:', error);
      return [];
    }
  }

  async getInspectionById(id: string): Promise<Inspection | undefined> {
    try {
      const { data: inspection, error } = await this.db
        .from('inspections')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar inspeção por ID:', error);
        return undefined;
      }

      return inspection;
    } catch (error) {
      console.error('Erro ao buscar inspeção por ID:', error);
      return undefined;
    }
  }

  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    try {
      const { data: inspection, error } = await this.db
        .from('inspections')
        .insert([insertInspection])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar inspeção: ${error.message}`);
      }

      return inspection;
    } catch (error) {
      console.error('Erro ao criar inspeção:', error);
      throw error;
    }
  }

  async updateInspection(id: string, updates: Partial<Inspection>): Promise<Inspection> {
    try {
      const { data: inspection, error } = await this.db
        .from('inspections')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar inspeção: ${error.message}`);
      }

      return inspection;
    } catch (error) {
      console.error('Erro ao atualizar inspeção:', error);
      throw error;
    }
  }

  async deleteInspection(id: string): Promise<void> {
    try {
      const { error } = await this.db
        .from('inspections')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao deletar inspeção: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao deletar inspeção:', error);
      throw error;
    }
  }

  // Ensure user from Supabase
  async ensureUserFromSupabase(supabaseUser: any): Promise<User> {
    try {
      // Verificar se o usuário já existe
      const existingUser = await this.getUserById(supabaseUser.id);
      
      if (existingUser) {
        return existingUser;
      }

      // Criar novo usuário se não existir
      const newUser: InsertUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
        role: supabaseUser.user_metadata?.role || 'viewer',
        businessUnit: supabaseUser.user_metadata?.businessUnit || 'Não definido',
        photo: supabaseUser.user_metadata?.photo,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await this.createUser(newUser);
    } catch (error) {
      console.error('Erro ao garantir usuário do Supabase:', error);
      throw error;
    }
  }

  // Admin user setup
  async ensureAdminUserExists(): Promise<void> {
    try {
      const adminEmail = 'admin@enso.com';
      const existingAdmin = await this.getUserByEmail(adminEmail);
      
      if (!existingAdmin) {
        console.log('Criando usuário admin padrão...');
        
        const adminUser: InsertUser = {
          id: 'admin-user-id',
          email: adminEmail,
          name: 'Administrador',
          role: 'admin',
          businessUnit: 'Sistema',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await this.createUser(adminUser);
        console.log('Usuário admin criado com sucesso!');
      } else {
        console.log('Usuário admin já existe.');
      }
    } catch (error) {
      console.error('Erro ao verificar/criar usuário admin:', error);
    }
  }
}

export const storage = new DatabaseStorage();
