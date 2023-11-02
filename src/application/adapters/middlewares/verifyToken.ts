import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import * as dotenv from 'dotenv';
dotenv.config();

const secretKey = 'rgBwl4pxy1TIW0G7g6wxMSp3Q7kD0qGg9rSQrK0S8i4=';

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, `${secretKey}`, (error, decoded) => {
    if (error) {
      return res.status(403).json({ message: 'Token inválido' });
    } else {
      req.body.payloadJwt = decoded;
      next();
    }
  });
}
