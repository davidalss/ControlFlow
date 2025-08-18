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
    if (!token) return res.status(401).json({ message: 'Token ausente' });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ message: 'Token inválido' });

    // Garante que o usuário exista no nosso banco (mesmo id do Supabase)
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

    return next();
  } catch (err) {
    console.error('authenticateSupabaseToken error', err);
    return res.status(500).json({ message: 'Erro interno de autenticação' });
  }
}


