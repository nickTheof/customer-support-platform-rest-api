import {z} from "zod/v4";

export const bcryptSchema = z.object({
    SALT_ROUNDS: z.string().regex(/^\d+$/).default("11").transform(Number).refine(
        (val) => val >= 8 && val <= 15,
        { message: "SALT_ROUNDS must be between 8 and 15" }
    )
})

export const corsSchema = z.object({
    ALLOWED_ORIGINS: z.string().min(1),
})

export const jwtSchema = z.object({
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES: z.string().regex(/^\d+$/).default("3600").transform(Number)
})

export const limiterSchema = z.object({
    RATE_LIMIT_WINDOW_MINUTES: z.string().regex(/^\d+$/).default("15").transform(Number),
    RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).default("100").transform(Number),
})

export const mailerSchema = z.object({
    MAILER_HOST: z.string().min(1),
    MAILER_PORT: z.string().regex(/^\d+$/).default("587").transform(Number),
    MAILER_USERNAME: z.string().min(1),
    MAILER_PASSWORD: z.string().min(1),
})

export const mongoSchema = z.object({
    MONGODB_USER: z.string().min(1),
    MONGODB_PASSWORD: z.string().min(1),
    MONGODB_CLUSTER_URI: z.string().min(1),
    MONGODB_DATABASE: z.string().min(1),
})

export const envSchema = z.object({
    ...bcryptSchema.shape,
    ...corsSchema.shape,
    ...jwtSchema.shape,
    ...mongoSchema.shape,
    ...limiterSchema.shape,
    ...mailerSchema.shape,
    NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
    PORT: z.string().regex(/^\d+$/).default("3000").transform(Number),
    API_VERSION: z.string().nonempty().default("v1"),
    FRONTEND_VERIFICATION_URL:z.string().nonempty(),
    FRONTEND_PASSWORD_RECOVERY_URL: z.string().nonempty(),
    FRONTEND_UNLOCK_ACCOUNT_URL: z.string().nonempty()
})
