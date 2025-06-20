import {Router} from "express";
import healthController from "../controllers/HealthCheckController";

export function createHealthCheckRoutes() {
    const router: Router = Router();
    router.get("/health", healthController.healthCheck)
    return router;
}