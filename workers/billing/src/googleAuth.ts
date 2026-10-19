import { SignJWT, importPKCS8 } from 'jose'

type Cached = { token: string; expires: number }
type Account = { client_email: string; private_key: string }
let cached: Cached | null = null

/**
 * The service-account JSON as stored in the secret. A pasted value sometimes has real line breaks inside the private key (which is not
 * valid JSON), so when the plain read fails the two fields that matter are picked out by hand.
 */
export function readServiceAccount(text: string): Account {
  let account: Partial<Account> = {}
  try { account = JSON.parse(text) as Account } catch {
    account = {
      client_email: /"client_email"\s*:\s*"([^"]+)"/.exec(text)?.[1],
      private_key: /"private_key"\s*:\s*"([\s\S]*?)"\s*[,}]/.exec(text)?.[1]?.replace(/\\n/g, "\n"),
    }
  }
  const key = account.private_key?.replace(/\r/g, '')
  if (!account.client_email || !key?.includes('-----BEGIN PRIVATE KEY-----') || !key.includes('-----END PRIVATE KEY-----')) {
    throw new Error('The GOOGLE_SERVICE_ACCOUNT secret is incomplete: set it again from the whole downloaded .json file (wrangler secret put GOOGLE_SERVICE_ACCOUNT < key.json).')
  }
  return { client_email: account.client_email, private_key: key }
}

/**
 * An access token for Firestore, from the service account (a signed request exchanged at Google for a one-hour token).
 * Kept in memory between requests of the same worker instance.
 */
export async function serviceAccountToken(serviceAccountJson: string, fetchFn: typeof fetch = fetch): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cached && cached.expires - 60 > now) return cached.token
  const account = readServiceAccount(serviceAccountJson)
  const key = await importPKCS8(account.private_key, 'RS256')
  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/datastore' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(account.client_email).setSubject(account.client_email)
    .setAudience('https://oauth2.googleapis.com/token').setIssuedAt(now).setExpirationTime(now + 3600)
    .sign(key)
  const response = await fetchFn('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  })
  if (!response.ok) throw new Error(`Could not get a Google access token (${response.status})`)
  const { access_token: token, expires_in: seconds } = (await response.json()) as { access_token: string; expires_in: number }
  cached = { token, expires: now + seconds }
  return token
}
