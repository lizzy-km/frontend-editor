export const orderKeys = {
  all: ["orders"] as const,
  forUser: (userId: string) => ["orders", userId] as const,
};
