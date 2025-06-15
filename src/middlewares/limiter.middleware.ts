import {rateLimit} from 'express-rate-limit';
import env_config from "../core/env_config";
import logger from "../core/utils/logger";

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