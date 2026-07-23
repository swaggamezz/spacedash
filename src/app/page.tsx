import { Dashboard } from "@/components/dashboard";
import { getLaunches } from "@/lib/launches";

export const revalidate = 300;

export default async function Home() {
  const launches = await getLaunches();
  return <Dashboard launches={launches} />;
}
