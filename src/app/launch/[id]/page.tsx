import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLaunch, getRelatedLaunches } from "@/lib/launches";
import { MissionPage } from "@/components/mission-page";

export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const launch = await getLaunch(id);
  if (!launch) return { title: "Missie niet gevonden" };
  return {
    title: launch.name,
    description: launch.description,
    openGraph: {
      title: `${launch.name} · SpaceDash`,
      description: launch.description,
      type: "article",
    },
  };
}

export default async function LaunchPage({ params }: Props) {
  const { id } = await params;
  const launch = await getLaunch(id);
  if (!launch) notFound();
  const related = await getRelatedLaunches(launch);
  return <MissionPage launch={launch} related={related} />;
}
