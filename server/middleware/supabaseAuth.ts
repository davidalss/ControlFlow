import { createClient, type User as SupabaseUser } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import type { AuthRequest } from './auth';

// Verificar se as variáveis do Supabase estão configuradas
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function authenticateSupabaseToken(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('🔐 Autenticando requisição para:', req.path);
    
    // Se o Supabase não estiver configurado, usar autenticação local
    if (!supabase) {
      console.log('⚠️ Supabase não configurado, usando autenticação local');
      // Importar e usar o middleware de autenticação local
      const { authenticateToken } = await import('./auth');
      return authenticateToken(req, res, next);
    }
    
    console.log('📋 Headers:', {
      authorization: req.headers.authorization ? 'Presente' : 'Ausente',
      'user-agent': req.headers['user-agent']?.substring(0, 50) + '...'
    });

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    
    if (!token) {
      console.warn('❌ Token ausente na requisição:', req.path);
      return res.status(401).json({ 
        message: 'Token de autenticação ausente',
        error: 'AUTH_TOKEN_MISSING'
      });
    }

    console.log('🔍 Verificando token para rota:', req.path);
    console.log('🎫 Token (primeiros 20 chars):', token.substring(0, 20) + '...');
    
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('❌ Erro ao verificar token:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      
      // Se for erro de token inválido, tentar usar autenticação local como fallback
      if (error.message.includes('Invalid JWT') || error.message.includes('JWT')) {
        console.log('🔄 Token JWT inválido, tentando autenticação local...');
        try {
          const { authenticateToken } = await import('./auth');
          return authenticateToken(req, res, next);
        } catch (localAuthError) {
          console.error('❌ Erro na autenticação local:', localAuthError);
        }
      }
      
      return res.status(401).json({ 
        message: 'Token de autenticação inválido',
        error: 'AUTH_TOKEN_INVALID',
        details: error.message
      });
    }
    
    if (!data?.user) {
      console.warn('❌ Usuário não encontrado no token');
      return res.status(401).json({ 
        message: 'Usuário não encontrado',
        error: 'USER_NOT_FOUND'
      });
    }

    console.log('✅ Usuário autenticado:', {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role || 'N/A'
    });

    // Garante que o usuário exista no nosso banco (mesmo id do Supabase)
    try {
      console.log('🔄 Garantindo usuário no storage...');
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

      console.log('✅ Usuário configurado na requisição:', {
        id: localUser.id,
        email: localUser.email,
        role: localUser.role
      });
      return next();
    } catch (storageError) {
      console.error('❌ Erro ao garantir usuário no storage:', storageError);
      return res.status(500).json({ 
        message: 'Erro interno de autenticação',
        error: 'STORAGE_ERROR',
        details: storageError instanceof Error ? storageError.message : 'Erro desconhecido'
      });
    }
  } catch (err) {
    console.error('❌ Erro inesperado no authenticateSupabaseToken:', err);
    return res.status(500).json({ 
      message: 'Erro interno de autenticação',
      error: 'UNEXPECTED_ERROR',
      details: err instanceof Error ? err.message : 'Erro desconhecido'
    });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado para esta função' });
    }
    next();
  };
}
