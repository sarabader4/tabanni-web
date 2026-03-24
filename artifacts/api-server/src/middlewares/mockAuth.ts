import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}

export function mockAuth(req: Request, _res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === "production") {
    req.userId = 0;
  } else {
    req.userId = 1;
  }
  next();
}
