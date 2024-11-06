import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/routers/_app";

export async function createContext({
  req,
  res,
}: trpcNext.CreateNextContextOptions) {
  return { req, res };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});
