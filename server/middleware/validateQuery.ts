import { Request, Response, NextFunction } from "express";
import { SalesFilters } from "../types";

declare global {
  namespace Express {
    interface Request {
      salesFilters?: SalesFilters;
    }
  }
}

/**
 * Validates and normalizes the shared filter query params
 * (startDate, endDate, repId?, categoryId?, regionId?).
 * On failure, responds 400 with a plain-language message —
 * never a raw stack trace, per the "no technical jargon" requirement.
 */
export function validateQuery(req: Request, res: Response, next: NextFunction) {
  const { startDate, endDate, repId, categoryId, regionId } = req.query;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!startDate || !endDate || typeof startDate !== "string" || typeof endDate !== "string") {
    return res.status(400).json({ error: "startDate and endDate are required (format YYYY-MM-DD)." });
  }

  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return res.status(400).json({ error: "startDate and endDate must be in YYYY-MM-DD format." });
  }

  if (startDate > endDate) {
    return res.status(400).json({ error: "startDate must be before or equal to endDate." });
  }

  const parsedRepId = repId ? Number(repId) : undefined;
  const parsedCategoryId = categoryId ? Number(categoryId) : undefined;
  const parsedRegionId = regionId ? Number(regionId) : undefined;

  if (repId && Number.isNaN(parsedRepId)) {
    return res.status(400).json({ error: "repId must be a number." });
  }
  if (categoryId && Number.isNaN(parsedCategoryId)) {
    return res.status(400).json({ error: "categoryId must be a number." });
  }
  if (regionId && Number.isNaN(parsedRegionId)) {
    return res.status(400).json({ error: "regionId must be a number." });
  }

  req.salesFilters = {
    startDate,
    endDate,
    repId: parsedRepId,
    categoryId: parsedCategoryId,
    regionId: parsedRegionId,
  };

  next();
}
