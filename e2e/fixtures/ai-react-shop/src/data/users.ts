import type { StoredUser } from "@/features/auth";

export const DEMO_MEMBER_ID = "u-member";

export const demoUsers: StoredUser[] = [
  { id: "u-admin", name: "Ada Admin", email: "admin@example.com", password: "admin123", role: "admin" },
  { id: DEMO_MEMBER_ID, name: "Maya Member", email: "member@example.com", password: "member123", role: "member" },
];
