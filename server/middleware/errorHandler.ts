import { Request, Response, NextFunction } from "express";

/**
 * Catches any error thrown in a route handler and returns a
 * consistent, user-safe JSON response. Full details are logged
 * server-side only — never sent to the client.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  console.error(`[error] ${req.method} ${req.path}:`, err);
  res.status(500).json({ error: "Something went wrong, please try again." });
}

/** Wraps an async route handler so thrown errors reach errorHandler. */
export function asyncRoute(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
