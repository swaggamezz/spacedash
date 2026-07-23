import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WatchCenter } from "@/components/watch-center";
import { getLaunch } from "@/lib/launches";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const launch = await getLaunch(id);
  if (!launch) return { title: "Watch Center niet gevonden" };
  return {
    title: `${launch.name} Watch Center`,
    description: `Bekijk beschikbare videofeeds en camerahoeken voor ${launch.name}.`,
  };
}

export default async function WatchPage({ params }: Props) {
  const { id } = await params;
  const launch = await getLaunch(id);
  if (!launch) notFound();
  return <WatchCenter launch={launch} />;
}
