import { Observatory } from "@/components/observatory/Observatory";
import { PageHeader } from "@/components/common";
import { useApp } from "@/context/AppContext";

export default function ObservatoryPage() {
  const { t, active } = useApp();
  return (
    <div className="space-y-6 px-4 pb-16 pt-8 sm:px-6 lg:px-10" data-testid="observatory-page">
      <PageHeader eyebrow={`${t("natal")}: ${active.name}`} title={t("observatory")}>
        Orbit, zoom and click any body. Switch to the KP sky to see sidereal longitudes against the zodiac, with natal points in gold.
      </PageHeader>
      <Observatory />
    </div>
  );
}
