import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Chave secreta para verificação de JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Interface estendida para requisições autenticadas
 * Inclui informações do usuário extraídas do token JWT
 */
interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware de autenticação para proteção de rotas
 * Valida tokens JWT e injeta informações do usuário
 * Gerencia erros de autenticação
 * 
 * @param handler - Função handler da API a ser protegida
 * @returns Função handler com autenticação aplicada
 */
export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Extrai o token do header Authorization
      const token = req.headers.authorization?.split(' ')[1];

      // Verifica se o token foi fornecido
      if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
      }

      // Verifica e decodifica o token JWT
      const decoded = verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
      };

      // Injeta as informações do usuário na requisição
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      logger.error('Authentication error:', error);
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  };
}
