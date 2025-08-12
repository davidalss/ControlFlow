import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { SERVER_BOOT_ID } from '../boot';

const JWT_SECRET = process.env.JWT_SECRET || 'wap-quality-control-secret';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    photo?: string;
    businessUnit?: string;
    createdAt?: Date;
    expiresAt?: Date;
  };
}

export function generateToken(user: { id: string; email: string; name: string; role: string }) {
  return jwt.sign({ ...user, bootId: SERVER_BOOT_ID }, JWT_SECRET, { expiresIn: '8h' });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    try {
      if (err) {
        return res.status(403).json({ message: 'Token inválido ou expirado' });
      }

      const payload = user as any;
      if (!payload || payload.bootId !== SERVER_BOOT_ID) {
        return res.status(403).json({ message: 'Sessão inválida. Faça login novamente.' });
      }

      const fullUser = await storage.getUser(payload.id);

      if (!fullUser) {
        return res.status(403).json({ message: 'Usuário não encontrado' });
      }

      if (fullUser.expiresAt && new Date(fullUser.expiresAt) < new Date()) {
        return res.status(403).json({ message: 'Sessão expirada. Faça login novamente.' });
      }

      req.user = fullUser as any;
      next();
    } catch (error) {
      console.error('Error in authenticateToken:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado para esta função' });
    }
    next();
  };
}
