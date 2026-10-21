import { apiClient, mockDelay, USE_MOCK } from "@/api/client";
import { demoUsers } from "@/data/users";
import { createPersistentStore } from "@/shared/lib/persistentStore";
import type { Session, SessionUser } from "@/shared/lib/session";
import type { ForgotPasswordInput, LoginInput, RegisterInput, StoredUser } from "../types";

const USERS_KEY = "alder:users";
const INVALID_LOGIN = "That email and password do not match. Check them and try again.";
const EMAIL_TAKEN = "There is already an account with that email. Try logging in instead.";

const usersStore = createPersistentStore<StoredUser[]>(USERS_KEY, demoUsers);

function toUser(user: StoredUser): SessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function toSession(user: StoredUser): Session {
  return { token: `mock-token-${user.id}`, user: toUser(user) };
}

async function mockLogin(input: LoginInput): Promise<Session> {
  await mockDelay(null);
  const email = input.email.trim().toLowerCase();
  const user = usersStore.get().find((item) => item.email === email && item.password === input.password);
  if (!user) throw new Error(INVALID_LOGIN);
  return toSession(user);
}

async function mockRegister(input: RegisterInput): Promise<Session> {
  await mockDelay(null);
  const email = input.email.trim().toLowerCase();
  if (usersStore.get().some((item) => item.email === email)) throw new Error(EMAIL_TAKEN);
  const user: StoredUser = {
    id: `u-${Date.now()}`,
    name: input.name.trim(),
    email,
    password: input.password,
    role: "member",
  };
  usersStore.set([...usersStore.get(), user]);
  return toSession(user);
}

// Signs a person in with email and password and returns their session.
export async function login(input: LoginInput): Promise<Session> {
  if (USE_MOCK) return mockLogin(input);
  const { data } = await apiClient.post<Session>("/auth/login", input);
  return data;
}

// Creates a new member account and returns the new session.
export async function register(input: RegisterInput): Promise<Session> {
  if (USE_MOCK) return mockRegister(input);
  const { name, email, password } = input;
  const { data } = await apiClient.post<Session>("/auth/register", { name, email, password });
  return data;
}

// Asks the server to email a password reset link.
export async function requestPasswordReset(input: ForgotPasswordInput): Promise<void> {
  if (USE_MOCK) {
    await mockDelay(null);
    return;
  }
  await apiClient.post("/auth/forgot-password", input);
}

// Fetches the signed-in person from the server using the saved token.
export async function fetchCurrentUser(): Promise<SessionUser> {
  const { data } = await apiClient.get<SessionUser>("/auth/me");
  return data;
}
