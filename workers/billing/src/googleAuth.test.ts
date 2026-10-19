// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readServiceAccount } from './googleAuth'

const KEY = '-----BEGIN PRIVATE KEY-----\nAAAA\nBBBB\n-----END PRIVATE KEY-----\n'
const account = { type: 'service_account', client_email: 'x@p.iam.gserviceaccount.com', private_key: KEY, token_uri: 'https://oauth2.googleapis.com/token' }

describe('reading the service-account secret', () => {
  it('reads the file as it was downloaded', () => {
    expect(readServiceAccount(JSON.stringify(account))).toEqual({ client_email: account.client_email, private_key: KEY })
  })

  it('still reads it when the private key was pasted with real line breaks (not valid JSON)', () => {
    const pasted = JSON.stringify(account, null, 2).split('\\n').join('\n')
    expect(() => JSON.parse(pasted)).toThrow()
    expect(readServiceAccount(pasted)).toEqual({ client_email: account.client_email, private_key: KEY })
  })

  it('says to set it again when the key is cut off or the email is missing', () => {
    const cut = JSON.stringify(account).slice(0, 120)
    expect(() => readServiceAccount(cut)).toThrow('incomplete')
    expect(() => readServiceAccount('')).toThrow('incomplete')
    expect(() => readServiceAccount(JSON.stringify({ ...account, client_email: undefined }))).toThrow('incomplete')
    expect(() => readServiceAccount(JSON.stringify({ ...account, private_key: 'nope' }))).toThrow('incomplete')
  })
})
