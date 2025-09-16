import { randomBytes, createHash } from 'crypto'
import { db } from './db'
import { userApiKeys, users } from './db/schema'
import { eq, and } from 'drizzle-orm'

// Generate a new API key (returns the plain key)
export function generateApiKey(): string {
  return 'cb_' + randomBytes(32).toString('hex')
}

// Hash an API key for storage
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex')
}

// Create a new API key for a user
export async function createUserApiKey(userId: string, name: string): Promise<{ key: string; id: string }> {
  const plainKey = generateApiKey()
  const keyHash = hashApiKey(plainKey)

  const [result] = await db
    .insert(userApiKeys)
    .values({
      userId,
      name,
      keyHash,
    })
    .returning({ id: userApiKeys.id })

  return { key: plainKey, id: result.id }
}

// Get all API keys for a user (without the actual keys)
export async function getUserApiKeys(userId: string) {
  return await db
    .select({
      id: userApiKeys.id,
      name: userApiKeys.name,
      created: userApiKeys.created,
      lastUsed: userApiKeys.lastUsed,
    })
    .from(userApiKeys)
    .where(eq(userApiKeys.userId, userId))
    .orderBy(userApiKeys.created)
}

// Validate an API key and return user info
export async function validateUserApiKey(apiKey: string) {
  const keyHash = hashApiKey(apiKey)

  const result = await db
    .select({
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      keyId: userApiKeys.id,
    })
    .from(userApiKeys)
    .innerJoin(users, eq(userApiKeys.userId, users.id))
    .where(eq(userApiKeys.keyHash, keyHash))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  // Update last used timestamp
  await db
    .update(userApiKeys)
    .set({ lastUsed: new Date() })
    .where(eq(userApiKeys.id, result[0].keyId))

  return result[0]
}

// Delete an API key
export async function deleteUserApiKey(userId: string, keyId: string): Promise<boolean> {
  const result = await db
    .delete(userApiKeys)
    .where(and(
      eq(userApiKeys.id, keyId),
      eq(userApiKeys.userId, userId)
    ))
    .returning({ id: userApiKeys.id })

  return result.length > 0
}