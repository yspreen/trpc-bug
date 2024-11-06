import {
  httpBatchLink,
  splitLink,
  unstable_httpSubscriptionLink,
} from "@trpc/client";

import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "../server/routers/_app";
import { ssrPrepass } from "@trpc/next/ssrPrepass";

function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config(opts) {
    const { ctx } = opts;
    if (typeof window !== "undefined") {
      // during client requests
      return {
        queryClientConfig: {
          defaultOptions: {
            queries: {
              // With SSR, we usually want to set some default staleTime
              // above 0 to avoid refetching immediately on the client
              staleTime: 30 * 1000,
            },
          },
        },
        links: [
          splitLink({
            condition: (op) => op.type === "subscription",
            true: unstable_httpSubscriptionLink({
              url: `/api/trpc`,
            }),
            false: httpBatchLink({
              url: "/api/trpc",
            }),
          }),
        ],
      };
    }
    return {
      queryClientConfig: {
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 30 * 1000,
          },
        },
      },
      links: [
        splitLink({
          condition: (op) => op.type === "subscription",
          true: unstable_httpSubscriptionLink({
            // The server needs to know your app's full url
            url: `${getBaseUrl()}/api/trpc`,
            // no cookies for subscriptions
          }),
          false: httpBatchLink({
            // The server needs to know your app's full url
            url: `${getBaseUrl()}/api/trpc`,
            /**
             * Set custom request headers on every request from tRPC
             * @see https://trpc.io/docs/v10/header
             */
            headers() {
              if (!ctx?.req?.headers) {
                return {};
              }
              // To use SSR properly, you need to forward client headers to the server
              // This is so you can pass through things like cookies when we're server-side rendering
              return {
                cookie: ctx.req.headers.cookie,
              };
            },
          }),
        }),
      ],
    };
  },
  /**
   * @see https://trpc.io/docs/v11/ssr
   **/
  ssr: true,
  ssrPrepass,
});
