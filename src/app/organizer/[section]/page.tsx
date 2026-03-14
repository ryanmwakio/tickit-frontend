import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { organizerSections, organizerModules } from "@/data/organizer";
import { OrganizerDashboardPanels } from "@/components/organizer/dashboard";
import { OrganizerRoleGrid } from "@/components/organizer/roles";
import { OrganizerModuleDetail } from "@/components/organizer/modules";
import { OrganizerBonusFeatures } from "@/components/organizer/bonus";
import { OrganizerEventsListing } from "@/components/organizer/events-listing";
import { TicketManagement } from "@/components/organizer/ticket-management";
import { OrdersCustomers } from "@/components/organizer/orders-customers";
import { CheckInGateControl } from "@/components/organizer/checkin-gate-control";
import { StaffAccessControl } from "@/components/organizer/staff-access-control";
import { FinanceSettlement } from "@/components/organizer/finance-settlement";
import { MarketingSuite } from "@/components/organizer/marketing-suite";
import { AnalyticsReports } from "@/components/organizer/analytics-reports";
import { SupportHelpDesk } from "@/components/organizer/support-help-desk";
import { ChatManagement } from "@/components/admin/chat/chat-management";
import { Integrations } from "@/components/organizer/integrations";
import { OrganizerSettings } from "@/components/organizer/organizer-settings";

type OrganizerSectionParams = {
  section: string;
};

type OrganizerSectionPageProps = {
  params: Promise<OrganizerSectionParams>;
};

export async function generateStaticParams() {
  return organizerSections.map((section) => ({
    section: section.id,
  }));
}

export async function generateMetadata({
  params,
}: OrganizerSectionPageProps): Promise<Metadata> {
  const { section: sectionId } = await params;
  const section = organizerSections.find((item) => item.id === sectionId);
  return {
    title: section ? `${section.title} | Organizer Portal` : "Organizer Portal",
    description:
      section?.description ??
      "End-to-end merchant portal for Kenyan event owners, ops, finance, and marketing teams.",
  };
}

function SectionHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="space-y-3">
      {badge ? (
        <span className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          {badge}
        </span>
      ) : null}
      <h1 className="text-4xl font-semibold text-slate-900">{title}</h1>
      <p className="text-base text-slate-600">{description}</p>
    </div>
  );
}

export default async function OrganizerSectionPage({
  params,
}: OrganizerSectionPageProps) {
  const { section: sectionId } = await params;
  const sectionMeta = organizerSections.find(
    (section) => section.id === sectionId,
  );

  if (!sectionMeta) {
    notFound();
  }

  if (sectionMeta.id === "dashboard") {
    return (
      <div className="space-y-10 pb-10">
        <OrganizerDashboardPanels />
      </div>
    );
  }

  if (sectionMeta.id === "bonus") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <OrganizerBonusFeatures />
      </div>
    );
  }

  // Handle events section with listing
  if (sectionMeta.id === "events") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <OrganizerEventsListing />
      </div>
    );
  }

  // Handle tickets section with ticket management
  if (sectionMeta.id === "tickets") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <TicketManagement />
      </div>
    );
  }

  // Handle orders section with orders & customers
  if (sectionMeta.id === "orders") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <OrdersCustomers />
      </div>
    );
  }

  // Handle checkins section with check-in & gate control
  if (sectionMeta.id === "checkins") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <CheckInGateControl />
      </div>
    );
  }

  // Handle staff section with staff & access control
  if (sectionMeta.id === "staff") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <StaffAccessControl />
      </div>
    );
  }

  // Handle finance section with finance & settlement
  if (sectionMeta.id === "finance") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <FinanceSettlement />
      </div>
    );
  }

  // Handle marketing section with marketing suite
  if (sectionMeta.id === "marketing") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <MarketingSuite />
      </div>
    );
  }

  // Handle analytics section with analytics & reports
  if (sectionMeta.id === "analytics") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <AnalyticsReports />
      </div>
    );
  }

  // Handle support section with support & help desk
  if (sectionMeta.id === "support") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <SupportHelpDesk />
      </div>
    );
  }

  // Handle chat section with live chat management
  if (sectionMeta.id === "chat") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <ChatManagement />
      </div>
    );
  }

  // Handle integrations section
  if (sectionMeta.id === "integrations") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <Integrations />
      </div>
    );
  }

  // Handle settings section with organizer settings
  if (sectionMeta.id === "settings") {
    return (
      <div className="space-y-10 pb-10">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
        <OrganizerSettings />
      </div>
    );
  }

  const moduleDefinition = organizerModules.find(
    (candidate) => candidate.id === sectionMeta.id,
  );

  if (!moduleDefinition) {
    notFound();
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        />
      </div>
    </div>
  );
}
