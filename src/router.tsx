import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,       // 5 min — no refetch on every tab switch
        gcTime: 30 * 60 * 1000,          // 30 min in-memory cache for instant back-navigation
        refetchOnWindowFocus: false,      // don't refetch when alt-tabbing back
        refetchOnReconnect: true,         // do refetch after losing network
        retry: 1,                         // only retry once on failure
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
