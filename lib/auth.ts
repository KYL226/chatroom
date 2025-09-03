import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface PasswordResetPayload {
  userId: string;
  email: string;
  type: 'password-reset';
  iat?: number;
  exp?: number;
}

// Générer un token JWT
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token valide pendant 7 jours
  });
}

// Vérifier et décoder un token JWT
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    console.error('Token verification failed');
    return null;
  }
}

// Vérifier si un token est expiré
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

// Rafraîchir un token
export function refreshToken(token: string): string | null {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }
    
    // Créer un nouveau token avec les mêmes données mais une nouvelle expiration
    const { ...payload } = decoded;
    return generateToken(payload);
  } catch {
    return null;
  }
}

// Middleware pour extraire le token depuis les headers
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

// Fonction utilitaire pour créer un token de réinitialisation de mot de passe
export function generatePasswordResetToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, type: 'password-reset' },
    JWT_SECRET,
    { expiresIn: '1h' } // Token valide pendant 1 heure
  );
}

// Fonction utilitaire pour vérifier un token de réinitialisation
export function verifyPasswordResetToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PasswordResetPayload;
    if (decoded.type === 'password-reset') {
      return {
        userId: decoded.userId,
        email: decoded.email
      };
    }
    return null;
  } catch {
    return null;
  }
} 