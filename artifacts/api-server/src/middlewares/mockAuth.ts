import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}

export function mockAuth(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === "production" && !process.env.MOCK_AUTH_USER_ID) {
    req.userId = 0;
    next();
    return;
  }
  const configuredId = process.env.MOCK_AUTH_USER_ID ? Number(process.env.MOCK_AUTH_USER_ID) : 1;
  req.userId = isNaN(configuredId) ? 1 : configuredId;
  next();
}
