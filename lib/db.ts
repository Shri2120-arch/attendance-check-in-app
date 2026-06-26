import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Connect the Neon integration to enable attendance logging.")
}

// Single SQL tagged-template client backed by Neon's serverless driver.
export const sql = neon(process.env.DATABASE_URL)
