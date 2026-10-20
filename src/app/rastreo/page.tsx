import { Suspense } from "react";
import { RastreoEsqueleto } from "@/components/rastreo/rastreo-esqueleto";
import { RastreoView } from "@/components/rastreo/rastreo-view";

export default function RastreoPage() {
  return (
    <Suspense fallback={<RastreoEsqueleto />}>
      <RastreoView />
    </Suspense>
  );
}
