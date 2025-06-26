import express, {Request, Response} from 'express';
import helmet from "helmet";
import cors from "cors";
import env_config from "./core/env_config";
import hpp from "hpp";
import limiter from "./middlewares/limiter.middleware";
import {AppObjectNotFoundException} from "./core/exceptions/app.exceptions";
import errorHandler from "./middlewares/error.middlewares";
import {roleRoutes, userRoutes, authRoutes, healthCheckRoutes, announcementRoutes} from "./container";

// Initialize Express application
const app = express();

/**
 * Security Middlewares
 *
 * These middlewares are crucial for protecting the application from common web vulnerabilities.
 */

// Helmet helps secure Express apps by setting various HTTP headers
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

// CORS configuration to restrict cross-origin requests
const ALLOWED_ORIGINS = env_config.ALLOWED_ORIGINS.split(",") || [];
app.use(
    cors({
        origin: ALLOWED_ORIGINS,
        credentials: true,
    })
);

/**
 * Request Processing Middlewares
 */

// Parse incoming requests with JSON payloads (limit: 10kb to prevent DOS attacks)
app.use(express.json({ limit: "10kb" }));
// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Protect against HTTP Parameter Pollution attacks
app.use(
    hpp({
        whitelist: [
            // Add parameters that should allow multiple values
        ],
    })
);

/**
 * Rate Limiting
 *
 * Apply rate limiting to all routes to prevent brute force attacks
 */
app.use("/", limiter);

/**
 * API Routes
 *
 * All routes are prefixed with /api/{version} for versioning support
 */
app.use(`/api/${env_config.API_VERSION}`, healthCheckRoutes)
app.use(`/api/${env_config.API_VERSION}/auth`, authRoutes)
app.use(`/api/${env_config.API_VERSION}/users`, userRoutes)
app.use(`/api/${env_config.API_VERSION}/roles`, roleRoutes)
app.use(`/api/${env_config.API_VERSION}/announcements`, announcementRoutes)


/**
 * Catch-all Route Handler
 *
 * Handles requests to undefined routes with a 404 response
 */
app.all("/{*splat}", (req: Request, _res: Response, next) => {
    next(new AppObjectNotFoundException(`Uri`, `Can't find the ${req.originalUrl} on the server`));
});

/**
 * Error Handling Middleware
 *
 * This should be the last middleware to catch all errors
 */
app.use(errorHandler)

export default app;