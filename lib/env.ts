import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().optional(),
})

export const env = envSchema.parse(process.env)

export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
