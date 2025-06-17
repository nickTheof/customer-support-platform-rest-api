import express, {Request, Response} from 'express';
import helmet from "helmet";
import cors from "cors";
import env_config from "./core/env_config";
import hpp from "hpp";
import limiter from "./middlewares/limiter.middleware";
import {AppObjectNotFoundException} from "./core/exceptions/app.exceptions";
import errorHandler from "./middlewares/error.middlewares";
import heathRouter from "./routes/healthcheck.routes";
import authRouter from "./routes/auth.routes";

const app = express();
// Use helmet for setting security headers
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

// Configure the allowed origins for this backend API
const ALLOWED_ORIGINS = env_config.ALLOWED_ORIGINS.split(",") || [];
app.use(
    cors({
        origin: ALLOWED_ORIGINS,
        credentials: true,
    })
);

// Body parser with size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(
    hpp({
        whitelist: [
        ],
    })
);

app.use("/", limiter);
app.use(`/api/${env_config.API_VERSION}`, heathRouter)
app.use(`/api/${env_config.API_VERSION}/auth`, authRouter)

app.all("/{*splat}", (req: Request, _res: Response, next) => {
    next(new AppObjectNotFoundException(`Uri`, `Can't find the ${req.originalUrl} on the server`));
});
app.use(errorHandler)

export default app;