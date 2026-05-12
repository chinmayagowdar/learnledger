import { Router, type IRouter } from "express";
import healthRouter from "./health";
import certificatesRouter from "./certificates";

const router: IRouter = Router();

router.use(healthRouter);
router.use(certificatesRouter);

export default router;
