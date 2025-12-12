"use client";

import { ApiSurfaceSection } from "@/components/system/api-surface";
import { ArchitectureSection } from "@/components/system/architecture";
import { DataModelSection } from "@/components/system/data-model";
import { FailureModesSection } from "@/components/system/failure-modes";
import { RoadmapSection } from "@/components/system/roadmap";
import { SecuritySection } from "@/components/system/security";
import { SequenceFlows } from "@/components/system/sequence-flows";
import { ServiceMatrix } from "@/components/system/service-matrix";
import { StorageStack } from "@/components/system/storage-stack";
import { SystemHero } from "@/components/system/hero";
import { AdminProtectedPage } from "@/components/auth/admin-protected-page";

export default function SystemPage() {
  return (
    <AdminProtectedPage>
      <div className="bg-white text-slate-900">
        <SystemHero />
        <ArchitectureSection />
        <ServiceMatrix />
        <StorageStack />
        <DataModelSection />
        <ApiSurfaceSection />
        <SequenceFlows />
        <SecuritySection />
        <RoadmapSection />
        <FailureModesSection />
      </div>
    </AdminProtectedPage>
  );
}


