import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RocketPage } from "@/components/rocket-page";
import { getRocket } from "@/lib/launch-vehicles";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const rocket = await getRocket(Number(id));
  if (!rocket) return { title: "Raket niet gevonden" };
  return {
    title: `${rocket.name} · SpaceDash`,
    description: rocket.description,
    openGraph: {
      title: `${rocket.name} · SpaceDash`,
      description: rocket.description,
      images: rocket.image ? [rocket.image] : undefined,
    },
  };
}

export default async function RocketRoute({ params }: Props) {
  const { id } = await params;
  const rocket = await getRocket(Number(id));
  if (!rocket) notFound();
  return <RocketPage rocket={rocket} />;
}
