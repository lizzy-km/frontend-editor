type Account = { client_email: string; private_key: string }

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
