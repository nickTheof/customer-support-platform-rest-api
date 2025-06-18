import {z} from "zod/v4";
import { envSchema } from '../../schemas/env.schemas'

export type ConfigType = z.infer<typeof envSchema>;
