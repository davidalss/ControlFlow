import { createClient, type User as SupabaseUser } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import type { AuthRequest } from './auth';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function authenticateSupabaseToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    
    if (!token) {
      console.warn('Token ausente na requisição:', req.path);
      return res.status(401).json({ message: 'Token de autenticação ausente' });
    }

    console.log('Verificando token para rota:', req.path);
    
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Erro ao verificar token:', error);
      return res.status(401).json({ message: 'Token de autenticação inválido' });
    }
    
    if (!data?.user) {
      console.warn('Usuário não encontrado no token');
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    console.log('Usuário autenticado:', data.user.email);

    // Garante que o usuário exista no nosso banco (mesmo id do Supabase)
    try {
      const localUser = await storage.ensureUserFromSupabase(data.user);
      
      (req as AuthRequest).user = {
        id: localUser.id,
        email: localUser.email,
        name: localUser.name,
        role: localUser.role,
        photo: localUser.photo,
        businessUnit: localUser.businessUnit,
        createdAt: localUser.createdAt as any,
        expiresAt: localUser.expiresAt as any,
      };

      console.log('Usuário configurado na requisição:', localUser.email);
      return next();
    } catch (storageError) {
      console.error('Erro ao garantir usuário no storage:', storageError);
      return res.status(500).json({ message: 'Erro interno de autenticação' });
    }
  } catch (err) {
    console.error('Erro inesperado no authenticateSupabaseToken:', err);
    return res.status(500).json({ message: 'Erro interno de autenticação' });
  }
}


