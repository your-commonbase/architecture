// Re-export everything from the new auth config
export {
  isAuthEnabled,
  authOptions,
  handlers,
  auth,
  signIn,
  signOut
} from './auth-config'

// Legacy getAuth function for backward compatibility
export async function getAuth() {
  const { handlers, auth, signIn, signOut, authOptions } = await import('./auth-config')
  return {
    handlers,
    auth,
    signIn,
    signOut,
    authOptions
  }
}