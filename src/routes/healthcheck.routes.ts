import {Router} from "express";
import healthController from "../controllers/healthcheck.controllers";

const router: Router = Router();

router.get("/health", healthController.healthCheck)

export default router;