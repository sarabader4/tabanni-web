import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const MOCK_USER_ID = process.env.MOCK_AUTH_USER_ID ? Number(process.env.MOCK_AUTH_USER_ID) : 1;

export function mockAuth(req: Request, res: Response, next: NextFunction): void {
  if (IS_PRODUCTION) {
    res.status(501).json({ error: "not_implemented", message: "Real authentication is required in production." });
    return;
  }
  req.userId = MOCK_USER_ID;
  next();
}
