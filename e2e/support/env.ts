import { z } from 'zod'

const envSchema = z.object({
  BASE_URL: z.string().url().default('https://www.episode.watch'),
  FALLBACK_URL: z.string().url().default('https://last-episode.vercel.app'),
  TEST_USER_EMAIL: z.string().email(),
  TEST_USER_PASSWORD: z.string().min(1),
  HEADLESS: z.string().default('true'),
})

export const env = envSchema.parse({
  BASE_URL: process.env.BASE_URL,
  FALLBACK_URL: process.env.FALLBACK_URL,
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
  TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
  HEADLESS: process.env.HEADLESS,
})
