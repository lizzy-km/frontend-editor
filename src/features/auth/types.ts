/** The signed-in person, as the app needs it (not Firebase's full User). */
export type AppUser = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut' | 'unconfigured'

export type OAuthProvider = 'google' | 'github'
