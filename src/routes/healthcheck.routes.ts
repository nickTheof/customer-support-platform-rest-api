import {Router} from "express";
import healthController from "../controllers/HealthCheckController";

/**
 * Creates and configures health check routes
 *
 * This router handles basic service health monitoring endpoints that can be used by:
 * - Load balancers for uptime monitoring
 * - DevOps tools for service health checks
 * - Kubernetes liveness/readiness probes
 *
 * @returns {Router} Express router with health check routes configured
 */
export function createHealthCheckRoutes() {
    // Initialize router
    const router: Router = Router();

    router.get("/health", healthController.healthCheck)

    return router;
}