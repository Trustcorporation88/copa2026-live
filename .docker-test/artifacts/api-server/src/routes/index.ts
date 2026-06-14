import { Router, type IRouter } from "express";
import healthRouter from "./health";
import copa2026Router from "./copa2026";

const router: IRouter = Router();

router.use(healthRouter);
router.use(copa2026Router);

export default router;
