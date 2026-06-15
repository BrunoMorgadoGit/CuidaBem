
export interface JwtPayload {
  sub: string;
  accountId: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
