import { Router, type IRouter } from "express";
import healthRouter from "./health";
import certificatesRouter from "./certificates";
import resumesRouter from "./resumes.js";
import blockchainRouter from "./blockchain.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(certificatesRouter);
router.use(resumesRouter);
router.use(blockchainRouter);

export default router;
