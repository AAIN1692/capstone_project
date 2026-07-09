import { Router } from "express";
import { validateQuery } from "../middleware/validateQuery";
import { asyncRoute } from "../middleware/errorHandler";
import {
  getFilterOptions,
  getSummary,
  getTrend,
  getRepBreakdown,
  getCategoryBreakdown,
  getRegionBreakdown,
} from "../services/salesService";
import { Granularity } from "../types";

const router = Router();

router.get(
  "/filters/options",
  asyncRoute((req, res) => {
    res.json(getFilterOptions());
  })
);

router.get(
  "/summary",
  validateQuery,
  asyncRoute((req, res) => {
    res.json(getSummary(req.salesFilters!));
  })
);

router.get(
  "/trend",
  validateQuery,
  asyncRoute((req, res) => {
    const granularityParam = (req.query.granularity as string) || "weekly";
    const validGranularities: Granularity[] = ["daily", "weekly", "monthly"];
    if (!validGranularities.includes(granularityParam as Granularity)) {
      res.status(400).json({ error: "granularity must be one of: daily, weekly, monthly." });
      return;
    }
    res.json(getTrend(req.salesFilters!, granularityParam as Granularity));
  })
);

router.get(
  "/breakdown/reps",
  validateQuery,
  asyncRoute((req, res) => {
    res.json(getRepBreakdown(req.salesFilters!));
  })
);

router.get(
  "/breakdown/categories",
  validateQuery,
  asyncRoute((req, res) => {
    res.json(getCategoryBreakdown(req.salesFilters!));
  })
);

router.get(
  "/breakdown/regions",
  validateQuery,
  asyncRoute((req, res) => {
    res.json(getRegionBreakdown(req.salesFilters!));
  })
);

export default router;