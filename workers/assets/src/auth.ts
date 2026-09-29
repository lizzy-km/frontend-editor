import { createRemoteJWKSet, jwtVerify } from 'jose'

// Google's public keys for Firebase ID tokens (cached by jose between requests).
const FIREBASE_KEYS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
)

/**
 * Checks the "Authorization: Bearer <Firebase ID token>" header.
 * Returns the user's uid, or null when the token is missing/invalid/expired.
 */
export async function verifyFirebaseUser(request: Request, projectId: string): Promise<string | null> {
  const header = request.headers.get('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, FIREBASE_KEYS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    })
    return typeof payload.sub === 'string' && payload.sub ? payload.sub : null
  } catch {
    return null
  }
}
