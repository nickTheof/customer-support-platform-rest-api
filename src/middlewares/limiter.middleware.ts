import {rateLimit} from 'express-rate-limit';
import env_config from "../core/env_config";
import logger from "../core/utils/logger";

/**
 * Global Rate Limiter Middleware
 *
 * Protects the API against brute force and DDoS attacks by:
 * - Limiting requests per window per user/IP
 * - Providing clear error messages
 * - Supporting both authenticated and anonymous users
 * - Excluding health checks from limits
 *
 * Configuration:
 * - Window: Defined in minutes (converted to milliseconds)
 * - Max Requests: Maximum allowed per window
 * - Headers: Compliant with IETF draft standard
 */
const limiter = rateLimit({
    windowMs: env_config.RATE_LIMIT_WINDOW_MINUTES*60*1000,
    limit: env_config.RATE_LIMIT_MAX_REQUESTS,
    legacyHeaders: false,
    standardHeaders: 'draft-8',
    skip: (request => request.path === "/api/health"), // Exclude health checks
    keyGenerator: (request, response) => response.locals.user?.email || request.ip, // Track users if authenticated
    handler: (req, res) => {
        logger.warn(`[RateLimit] Too many requests from: ${res.locals.user?.email || req.ip}`);
        res.status(429).json({
            status: "fail",
            message: `Too many requests. Limit: ${env_config.RATE_LIMIT_MAX_REQUESTS} per ${env_config.RATE_LIMIT_WINDOW_MINUTES} minutes.`,
        });
    },
})

export default limiter;