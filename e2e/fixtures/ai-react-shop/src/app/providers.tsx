import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/features/auth";

const STALE_TIME_MS = 60_000;

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: STALE_TIME_MS, retry: 1, refetchOnWindowFocus: false } },
});

type ProvidersProps = {
  children: ReactNode;
};

// Wraps the app with the data cache (React Query) and the sign-in state.
export function Providers({ children }: ProvidersProps): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
