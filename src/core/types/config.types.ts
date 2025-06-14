import {z} from "zod/v4";
import {bcryptSchema, corsSchema, jwtSchema, envSchema, limiterSchema, mailerSchema, mongoSchema} from '../../schemas/env.schemas'

export type ConfigType = z.infer<typeof envSchema>;
export type LimiterConfigType = z.infer<typeof limiterSchema>;
export type CorsConfigType = z.infer<typeof corsSchema>;
export type BCryptConfigType = z.infer<typeof bcryptSchema>;
export type JwtConfigType = z.infer<typeof jwtSchema>;
export type MailerConfigType = z.infer<typeof mailerSchema>;
export type MongoDBConnectionType = z.infer<typeof mongoSchema>;