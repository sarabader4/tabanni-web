import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}

const MOCK_USER_ID = process.env.MOCK_AUTH_USER_ID ? Number(process.env.MOCK_AUTH_USER_ID) : 1;

export function mockAuth(req: Request, _res: Response, next: NextFunction): void {
  req.userId = MOCK_USER_ID;
  next();
}
