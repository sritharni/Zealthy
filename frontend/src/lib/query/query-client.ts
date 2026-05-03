import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/http/api-error";

const ONE_MINUTE = 60 * 1000;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: ONE_MINUTE,
        retry: (failureCount, error) => {
          // Don't burn retries on 4xx — those are not transient.
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}