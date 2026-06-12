import bcrypt from 'bcryptjs'

type Mode = 'hash' | 'verify'

/**
 * Handles password hashing and verification.
 *
 * @param mode - 'hash' to hash a password, 'verify' to compare a password.
 * @param password - The plain password (for both hash and verify).
 * @param hashed - The hashed password (only needed for verification).
 * @returns A promise that resolves to a hashed password string (for hash) or boolean (for verify).
 */

export default async function handlePassword (
  mode: Mode,
  password: string,
  hashed?: string
): Promise<string | boolean> {
  const saltRounds = 10

  if (mode === 'hash') {
    return await bcrypt.hash(password, saltRounds)
  }

  if (mode === 'verify') {
    if (!hashed)
      throw new Error('Hashed password is required for verification.')
    return await bcrypt.compare(password, hashed)
  }

  throw new Error("Invalid mode. Use 'hash' or 'verify'.")
}
