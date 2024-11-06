import { procedure, router } from "../trpc";

import { on, EventEmitter } from "events";

export const events = new EventEmitter();

export const appRouter = router({
  eventBased: procedure.subscription(async function* ({ signal }) {
    try {
      // listen for new events
      for await (const [data] of on(events, "add", {
        // Passing the AbortSignal from the request automatically cancels the event emitter when the request is aborted
        signal,
      })) {
        yield { data };
      }
    } catch (error) {
      console.error("eventBased:", error);
    }
  }),
  loopBased: procedure.subscription(async function* ({ signal }) {
    try {
      while (!signal?.aborted) {
        console.log("loop", signal, signal?.aborted);

        yield "new data";
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (error) {
      console.error("done", error);
    }
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
