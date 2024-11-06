import { trpc } from "@/utils/trpc";

function IndexPage() {
  const subscription = trpc.loopBased.useSubscription(undefined);

  return <div>{subscription.data}</div>;
}

export default function Page() {
  return <IndexPage />;
}
