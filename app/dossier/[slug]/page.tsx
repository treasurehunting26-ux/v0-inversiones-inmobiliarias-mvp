import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getDossier } from "@/lib/properties-api"
import { DossierView } from "@/components/dossier/dossier-view"

interface DossierPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: DossierPageProps): Promise<Metadata> {
  const { slug } = await params
  const property = await getDossier(slug).catch(() => null)
  return {
    title: property ? `${property.title} — Dossier B&G Consulting` : "Dossier no disponible",
    // Los dossiers son enlaces privados: no deben indexarse ni aparecer en buscadores.
    robots: { index: false, follow: false },
  }
}

export default async function DossierPage({ params }: DossierPageProps) {
  const { slug } = await params
  const property = await getDossier(slug)

  if (!property) {
    notFound()
  }

  return <DossierView property={property} />
}
