import { AdminAudienceGrid } from "@/components/admin/audience-grid";
import { AdminDashboardPanels } from "@/components/admin/dashboard-panels";
import { UserRoleManagement } from "@/components/admin/users/user-role-management";
import { EventManagement } from "@/components/admin/events/event-management";
import { AdminTicketManagement } from "@/components/admin/tickets/ticket-management";
import { CheckInGateManagement } from "@/components/admin/checkins/checkin-gate-management";
import { PaymentsFinancialManagement } from "@/components/admin/payments/payments-financial-management";
import { SupportCustomerService } from "@/components/admin/support/support-customer-service";
import { FraudPreventionSecurity } from "@/components/admin/fraud/fraud-prevention-security";
import { ReportingAnalytics } from "@/components/admin/analytics/reporting-analytics";
import { PlatformSettings } from "@/components/admin/settings/platform-settings";
import { APIManagement } from "@/components/admin/api/api-management";
import { VenuesSeatMaps } from "@/components/admin/venues/venues-seatmaps";
import { Merchandising } from "@/components/admin/merchandising/merchandising";
import { AdminIntegrations } from "@/components/admin/integrations/integrations";
import { MarketingGrowthTools } from "@/components/admin/marketing/marketing-growth-tools";
import { ContentManagement } from "@/components/admin/cms/content-management";
import { FeaturesManagement } from "@/components/admin/features/features-management";
import { ChatManagement } from "@/components/admin/chat/chat-management";
import { OrganiserApplications } from "@/components/admin/organiser-applications/organiser-applications";
import { adminSections, type AdminSection } from "@/data/admin";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type AdminSectionParams = {
  section: string;
};

type AdminSectionPageProps = {
  params: Promise<AdminSectionParams>;
};

export async function generateStaticParams() {
  return adminSections.map((section) => ({
    section: section.id,
  }));
}

export async function generateMetadata({
  params,
}: AdminSectionPageProps): Promise<Metadata> {
  const { section: sectionId } = await params;
  const section = adminSections.find((item) => item.id === sectionId);
  const title = section ? `${section.title} | Tixhub Admin` : "Tixhub Admin";
  return {
    title,
    description:
      section?.description ??
      "Full-stack admin console for Tixhub operations, organisers, finance, and support teams.",
  };
}

function SectionHeader({ section }: { section: AdminSection }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
        Admin / {section.title}
      </p>
      <h1 className="text-4xl font-semibold text-slate-900">{section.title}</h1>
      <p className="text-base text-slate-600">{section.description}</p>
    </div>
  );
}

export default async function AdminSectionPage({
  params,
}: AdminSectionPageProps) {
  const { section: sectionId } = await params;
  const section = adminSections.find((item) => item.id === sectionId);
  if (!section) {
    notFound();
  }

  const isDashboard = section.id === "dashboard";

  const renderSectionContent = () => {
    switch (section.id) {
      case "dashboard":
        return (
          <>
            <AdminDashboardPanels />
            <AdminAudienceGrid />
          </>
        );
      case "users":
        return <UserRoleManagement />;
      case "events":
        return <EventManagement />;
      case "tickets":
        return <AdminTicketManagement />;
      case "checkins":
        return <CheckInGateManagement />;
      case "payments":
        return <PaymentsFinancialManagement />;
      case "marketing":
        return <MarketingGrowthTools />;
      case "support":
        return <SupportCustomerService />;
      case "fraud":
        return <FraudPreventionSecurity />;
      case "analytics":
        return <ReportingAnalytics />;
      case "settings":
        return <PlatformSettings />;
      case "api":
        return <APIManagement />;
      case "venues":
        return <VenuesSeatMaps />;
      case "merch":
        return <Merchandising />;
      case "integrations":
        return <AdminIntegrations />;
      case "cms":
        return <ContentManagement />;
      case "features":
        return <FeaturesManagement />;
      case "chat":
        return <ChatManagement />;
      case "organiser-applications":
        return <OrganiserApplications />;
      default:
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-600">
              {section.title} features coming soon...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {isDashboard ? (
        renderSectionContent()
      ) : (
        <>
          <SectionHeader section={section} />
          {renderSectionContent()}
        </>
      )}
    </div>
  );
}
