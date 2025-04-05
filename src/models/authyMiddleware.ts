import { Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  user?: any;
}

export function authyMiddleware(req: AuthRequest, res: any, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1]; // Pega só o token (remove "Bearer")

  if (!token) {
    return res.status(401).json({ message: 'Token mal formatado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Salva o payload para usar nas rotas protegidas
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido ou expirado' });
  }
}
