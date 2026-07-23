import { Dashboard } from "@/components/dashboard";
import { getLaunches } from "@/lib/launches";
import { connection } from "next/server";

export const revalidate = 60;

export default async function Home() {
  await connection();
  const launches = await getLaunches();
  return <Dashboard launches={launches} />;
}
