import dotenv from 'dotenv';
import {z} from "zod/v4";
import {envSchema} from "../schemas/env.schemas";
import {ConfigType} from "./types/config.types";

dotenv.config();

const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error("Invalid environment variables:");
    console.error(z.treeifyError(_env.error))
    process.exit(1);
}

const env = _env.data;

export const env_config: ConfigType = {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    API_VERSION: env.API_VERSION,
    SALT_ROUNDS: env.SALT_ROUNDS,
    ALLOWED_ORIGINS: env.ALLOWED_ORIGINS,
    JWT_SECRET: env.JWT_SECRET,
    JWT_EXPIRES: env.JWT_EXPIRES,
    RATE_LIMIT_MAX_REQUESTS: env.RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_WINDOW_MINUTES: env.RATE_LIMIT_WINDOW_MINUTES,
    MAILER_HOST: env.MAILER_HOST,
    MAILER_PORT: env.MAILER_PORT,
    MAILER_USERNAME: env.MAILER_USERNAME,
    MAILER_PASSWORD: env.MAILER_PASSWORD,
    MONGODB_USER: env.MONGODB_USER,
    MONGODB_PASSWORD: env.MONGODB_PASSWORD,
    MONGODB_CLUSTER_URI: env.MONGODB_CLUSTER_URI,
    MONGODB_DATABASE: env.MONGODB_DATABASE,
}

export default env_config;