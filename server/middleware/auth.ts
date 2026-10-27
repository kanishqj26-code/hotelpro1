import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Users, UserDoc } from '../db.ts';

export const JWT_SECRET = process.env.JWT_SECRET || 'roomsforuse_super_secure_jwt_secret_college_project_2026';

export interface AuthRequest extends Request {
  user?: UserDoc;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access denied. No authorization token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const user = Users.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User not found or account is deactivated.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Access forbidden. Administrator privileges required.' });
    return;
  }
  next();
}
