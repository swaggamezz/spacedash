import { Dashboard } from "@/components/dashboard";
import { getLaunches, getLaunchStats } from "@/lib/launches";

export const revalidate = 300;

export default async function Home() {
  const [{ launches, degraded }, stats] = await Promise.all([
    getLaunches(),
    getLaunchStats(),
  ]);
  return <Dashboard launches={launches} degraded={degraded} stats={stats} />;
}
