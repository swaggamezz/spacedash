import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgencyPage } from "@/components/agency-page";
import { getAgency } from "@/lib/agencies";
import { getAgencyRockets } from "@/lib/launch-vehicles";
import { getAgencyLaunches } from "@/lib/launches";

export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const agency = await getAgency(Number(id));
  if (!agency) return { title: "Agentschap niet gevonden" };
  return {
    title: `${agency.name} · SpaceDash`,
    description: agency.description,
    openGraph: {
      title: `${agency.name} · SpaceDash`,
      description: agency.description,
      images: agency.image ? [agency.image] : undefined,
    },
  };
}

export default async function AgencyRoute({ params }: Props) {
  const { id } = await params;
  const agencyId = Number(id);
  if (!Number.isInteger(agencyId)) notFound();
  const [agency, rockets, launches] = await Promise.all([
    getAgency(agencyId),
    getAgencyRockets(agencyId),
    getAgencyLaunches(agencyId),
  ]);
  if (!agency) notFound();
  return <AgencyPage agency={agency} rockets={rockets} launches={launches} />;
}
