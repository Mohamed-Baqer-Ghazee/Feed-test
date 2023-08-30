import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';

export interface CustomRequest extends Request {
  token: JwtPayload;
}


export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    
const secretKey: Secret = process.env.TOKEN_SECRET as Secret;

if (!secretKey) {
  return res.status(500).json({ error: 'Internal Server Error' });
}
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    (req as CustomRequest).token = decoded;
    next();
  } catch (error) {
    handleAuthError(res, error);
  }
};

export const notAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);
  
  if (!token) {
    next();
    return;
  }

  try {
    const secretKey: Secret = process.env.TOKEN_SECRET as Secret;
    if (!secretKey) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    (req as CustomRequest).token = decoded;
    return res.status(403).json({ error: 'You are already signed in' });
  } catch (error) {
    next();
  }
};

function extractToken(req: Request): string | null {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}

function handleAuthError(res: Response, error: any) {
  if (error instanceof jwt.TokenExpiredError) {
    res.status(401).json({ error: 'Token expired' });
  } else if (error instanceof jwt.JsonWebTokenError) {
    res.status(401).json({ error: 'Invalid token' });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
