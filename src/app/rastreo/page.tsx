import { Suspense } from "react";
import { RastreoView } from "@/components/rastreo/rastreo-view";

export default function RastreoPage() {
  return (
    <Suspense fallback={null}>
      <RastreoView />
    </Suspense>
  );
}
