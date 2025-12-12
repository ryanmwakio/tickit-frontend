export type AdminFeatureGroup = {
  title: string;
  items: string[];
  badge?: string;
};

export type AdminSection = {
  id: string;
  title: string;
  description: string;
  badge?: string;
  groups: AdminFeatureGroup[];
};

type AdminAudience = {
  title: string;
  description: string;
  responsibilities: string[];
};

export const adminAudiences: AdminAudience[] = [
  {
    title: "Platform Super Admins",
    description:
      "Full guardians of the platform stack overseeing compliance, risk, and roadmaps.",
    responsibilities: [
      "Provision and audit internal roles and permission policies",
      "Control feature flags, legal copy, and emergency comms",
      "Monitor infrastructure health, incidents, and automation rollouts",
    ],
  },
  {
    title: "Event Organizers & Merchants",
    description:
      "Studios, promoters, venues, and agencies needing day-to-day ticket operations.",
    responsibilities: [
      "Launch and optimise events, seat maps, and ticketing recipes",
      "Brief cashiers, promoters, scanners, and finance collaborators",
      "Track payouts, refunds, marketing, and compliance tasks",
    ],
  },
  {
    title: "Finance & Compliance Teams",
    description:
      "Revenue operations ensuring reconciliations, payouts, tax, and fraud reviews.",
    responsibilities: [
      "Own MPESA, card, and bank recon dashboards with exports",
      "Approve refunds, handle disputes, and release settlement holds",
      "Maintain audit trails, VAT/VAT settings, and KRA-ready statements",
    ],
  },
  {
    title: "Support, Security & Field Ops",
    description:
      "Customer care, fraud analysts, and gate teams responding to live issues.",
    responsibilities: [
      "Search and amend orders, resend tickets, and trigger refunds",
      "Manage blacklists, investigate anomalies, and control check-ins",
      "Coordinate field devices, staff sessions, and VIP routing",
    ],
  },
];

export const adminSections: AdminSection[] = [
  {
    id: "dashboard",
    title: "Dashboard (Global Overview)",
    description:
      "Live intelligence for platform stability plus organizer performance signals.",
    groups: [
      {
        title: "Platform-Level Metrics",
        items: [
          "Total events live and active vs inactive split",
          "Total tickets sold and tickets scanned today",
          "Revenue today, this month, and year to date",
          "Number of active organisers and upcoming launches",
          "Refund requests pending and fraud detection alerts",
          "SMS / email queue status with delivery health",
          "Payment reconciliation status and settlement blockers",
          "Server health panels covering API latency and request volume",
        ],
      },
      {
        title: "Organizer-Level Metrics",
        items: [
          "Upcoming events and readiness status",
          "Ticket sales breakdown across VIP, Regular, Early Bird tiers",
          "Refund percentage, check-in rate, and no-show variance",
          "Top-selling events with conversion funnels",
          "Outstanding payouts and receivables per organiser",
        ],
      },
    ],
  },
  {
    id: "organiser-applications",
    title: "Organiser Applications",
    description:
      "Review and manage applications from organisers who want to host events on Tixhub.",
    groups: [
      {
        title: "Application Management",
        items: [
          "View all organiser applications with status filters",
          "Review application details including name, organisation, email, and event details",
          "Approve or reject applications with admin notes",
          "Track application history and reviewer information",
          "Export application data for reporting",
        ],
      },
    ],
  },
  {
    id: "users",
    title: "User & Role Management",
    description:
      "Granular identity, permissions, MFA, and organiser workspace governance.",
    groups: [
      {
        title: "Super Admin Functions",
        items: [
          "Create and manage admin users with lifecycle status",
          "Assign system roles (Super Admin, Support, Finance, Events, Marketing, Security/Fraud, Developer)",
          "Session logs with device, IP, and geo metadata",
          "Permission matrix builder with feature flag scopes",
          "2FA enforcement, reset flows, and backup codes",
          "Login attempt monitoring with anomaly alerts",
          "IP allow/block lists for back-office and APIs",
        ],
      },
      {
        title: "Organizer User Management",
        items: [
          "Provision organiser accounts and studios",
          "Assign staff roles (Owner, Cashier, Door Staff, Promoter, Finance Manager, Scanner Operator)",
          "Limit event or venue access per user and per shift",
          "Delegate temporary credentials for agencies or partners",
        ],
      },
    ],
  },
  {
    id: "events",
    title: "Event Management",
    description:
      "Creator studio with advanced ticket recipes, compliance, and publishing controls.",
    groups: [
      {
        title: "Event Creation Tools",
        items: [
          "Create, edit, publish, or unpublish events with versioning",
          "Schedule start/end times, recurring patterns, and blackout dates",
          "Rich descriptions, lineup builders, sponsor callouts, and FAQs",
          "Venue selection with geolocation search and capacity guardrails",
          "Event categories, tags, age restrictions, and accessibility notes",
          "Seating layout designer with drag-and-drop sections",
        ],
      },
      {
        title: "Ticket Advanced Settings",
        items: [
          "Ticket type recipes: Early bird, Regular, VIP, Reserved, Backstage, Free passes",
          "Price tiers with automatic switching logic",
          "Per-user purchase limits and holdback controls",
          "Sale schedules, waitlists, and promo code rules",
          "Affiliate link generation with attribution dashboards",
          "Upsells for merch, parking, VIP add-ons, and bundles",
        ],
      },
      {
        title: "Event Publishing Controls",
        items: [
          "Marketplace approval workflows and automated fraud checks",
          "Embeddable widgets plus SEO-friendly slugs and metadata",
          "Social share presets, hero assets, and invite-only toggles",
          "Visibility controls for public, private, or code-gated events",
        ],
      },
    ],
  },
  {
    id: "tickets",
    title: "Ticket Management",
    description:
      "Inventory guardrails, manual operations, and fraud-proof ticket lifecycle.",
    groups: [
      {
        title: "Ticket Inventory",
        items: [
          "Set total capacity per tier or section",
          "Real-time view of tickets remaining with holdbacks",
          "Block tickets from sale or auto-reallocate unsold VIP to Regular",
        ],
      },
      {
        title: "Ticket Operations",
        items: [
          "Issue complimentary tickets and sponsorship allocations",
          "Resend tickets via SMS/email and regenerate QR codes",
          "Void or reassign tickets to a new owner with audit trail",
          "Print ticket batches and export manifests",
          "Monitor sell-through rates and hourly sales trends",
        ],
      },
    ],
  },
  {
    id: "checkins",
    title: "Check-In & Gate Management",
    description:
      "Realtime gate visibility, duplicate detection, and device orchestration.",
    groups: [
      {
        title: "Scan Monitoring",
        items: [
          "Live count of attendees checked in vs expected",
          "Duplicate scan attempt alerts and fraud escalations",
          "Scan device logs with firmware, IP, and operator",
          "Geo-location of scans plus offline upload health",
        ],
      },
      {
        title: "Gate Controls",
        items: [
          "Add or remove gates and assign staff per lane",
          "Manage mobile scanner inventory and device states",
          "Allow early check-in windows or restrict late entry",
          "VIP-only fast lanes and backstage credentials",
        ],
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & Financial Management",
    description:
      "Multi-rail payments, reconciliation, settlements, and organiser wallets.",
    groups: [
      {
        title: "Payment Settings",
        items: [
          "Configure MPESA STK Push, Paybill/Till, VISA, Mastercard, PayPal, Stripe, Airtel Money, and bank transfer rails",
          "Set commission rates globally or per organiser plus VAT and platform fee rules",
          "Control organiser payout schedules and hold policies",
        ],
      },
      {
        title: "Transactions & Reconciliation",
        items: [
          "Monitor all transactions with success, failed, and pending statuses",
          "Review card chargebacks, refund processing, and dispute notes",
          "View MPESA C2B/B2C callback logs with retry actions",
          "Settlement statements, reconciliation dashboards, and exports",
          "Fraud-flagged payments queue for Security/Finance",
        ],
      },
      {
        title: "Organizer Wallet",
        items: [
          "Track money collected, pending settlement, and available balance",
          "Approve withdrawal requests and automated payouts",
          "Full payout audit trail with downloadable statements",
        ],
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing & Growth Tools",
    description:
      "Cross-channel campaigns, automations, loyalty, and affiliate insights.",
    groups: [
      {
        title: "Marketing Automations",
        items: [
          "Email, SMS, and push campaign builders with scheduling",
          "Abandoned cart reminders and smart nudges",
          "Early bird countdown notices and limited-drop alerts",
          "Post-event thank you flows and review requests",
        ],
      },
      {
        title: "Social & Affiliate Tools",
        items: [
          "Shareable posters and branded landing pages",
          "Social auto-posting and influencer tracking links",
          "Promo code, discount voucher, and loyalty point management",
          "Custom event pages with drag-and-drop components",
        ],
      },
    ],
  },
  {
    id: "support",
    title: "Support & Customer Service",
    description:
      "Unified workspace for orders, refunds, SLAs, and collaboration.",
    groups: [
      {
        title: "Customer Assistance Tools",
        items: [
          "Search tickets by name, phone, ticket ID, or QR payload",
          "View customer purchase history with status timelines",
          "Resend tickets via SMS/email and issue full or partial refunds",
          "Edit contact info on orders and blacklist suspicious accounts",
          "Embedded chat or notes module for ongoing conversations",
        ],
      },
      {
        title: "Support Dashboard",
        items: [
          "Track open tickets with priority flags and SLA timers",
          "Assign agents, share chat transcripts, and log actions",
          "Support logs exported for compliance or QA reviews",
        ],
      },
    ],
  },
  {
    id: "chat",
    title: "Live Chat Management",
    description:
      "Manage customer chat sessions, respond to inquiries, and monitor bot interactions.",
    groups: [
      {
        title: "Chat Management",
        items: [
          "View all active chat sessions with customers",
          "Respond to customer messages in real-time",
          "Assign chat sessions to support agents",
          "Monitor bot responses and escalate when needed",
          "Search and filter chats by status, user, or keywords",
        ],
      },
      {
        title: "Chat Analytics",
        items: [
          "Track unread message counts",
          "View chat session history and transcripts",
          "Monitor response times and resolution rates",
          "Export chat logs for compliance",
        ],
      },
    ],
  },
  {
    id: "fraud",
    title: "Fraud Prevention & Security",
    description:
      "Signals, device intelligence, and immutable audit trails.",
    groups: [
      {
        title: "Fraud Prevention Tools",
        items: [
          "Duplicate ticket detection and QR tamper proofing",
          "Multiple device login alerts and suspicious IP monitoring",
          "MPESA fraud pattern detection plus velocity checks",
          "Blacklist database for emails, phone numbers, and IP ranges",
          "Device fingerprinting and risk scoring per transaction",
        ],
      },
      {
        title: "Audit Logs",
        items: [
          "Every admin action recorded with before/after snapshots",
          "Ticket changes, payment updates, and event edits tracked",
          "Security events logged, including login failures and brute-force attempts",
        ],
      },
    ],
  },
  {
    id: "analytics",
    title: "Reporting & Analytics",
    description:
      "Self-serve boards plus export-ready financial statements.",
    groups: [
      {
        title: "Sales Reports",
        items: [
          "Revenue per event, organiser, and ticket type",
          "Sales per hour/day/week with conversion funnels",
          "Payment method breakdown and affiliate contribution",
          "Promo code redemption and campaign attribution",
        ],
      },
      {
        title: "Attendee Analytics",
        items: [
          "Check-in trends and no-show rates",
          "Geographic distribution plus device/browser stats",
          "Demographics and cohort retention where collected",
        ],
      },
      {
        title: "Financial Reports",
        items: [
          "Payouts, platform fees, VAT, and refund statements",
          "MPESA reconciliation reports and top spender insights",
          "Exports to PDF, CSV, or Excel with scheduler",
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "Platform Settings",
    description:
      "Centralised configuration for branding, comms, taxes, and CMS content.",
    groups: [
      {
        title: "Global Configurations",
        items: [
          "Branding themes for organiser portals and ticket emails",
          "Transactional email and SMS template editors",
          "Push notification providers and payment keys",
          "Commission, tax, and account verification (KYC) rules",
        ],
      },
      {
        title: "Content Management",
        items: [
          "CMS for privacy, terms, blog posts, and knowledge base",
          "Manage event categories, countries, cities, and venues",
          "Hero banners and sliders for marketplace merchandising",
        ],
      },
    ],
  },
  {
    id: "api",
    title: "API Management",
    description:
      "Developer-facing controls for keys, rate limits, and webhook health.",
    groups: [
      {
        title: "Developer Controls",
        items: [
          "API key creation per organiser with scopes and expiry",
          "Rate limiting policies per key and per endpoint",
          "Webhook settings for ticket purchase, refund, and check-in events",
          "Usage logs, webhook retry attempts, and alerting hooks",
          "JWT key rotation manager plus embedded Swagger explorer",
        ],
      },
    ],
  },
  {
    id: "venues",
    title: "Venues & Seat Maps",
    description:
      "Venue catalogue, seating models, and pricing zones.",
    groups: [
      {
        title: "Venue Database",
        items: [
          "Store venue profiles with address, contacts, and compliance docs",
          "Attach galleries, amenity checklists, and accessibility notes",
          "Assign seat map templates and default capacity guards",
        ],
      },
      {
        title: "Seat Map Builder",
        items: [
          "Visual designer with import tools for CAD or CSV layouts",
          "Pricing zones, seat assignment logic, and availability matrix",
          "Optional 3D previews for premium partners",
        ],
      },
    ],
  },
  {
    id: "merch",
    title: "Merchandising",
    description:
      "Optional commerce layer for bundles, fulfilment, and onsite pickup.",
    groups: [
      {
        title: "Merch Tools",
        items: [
          "Sell merchandise, add-ons, or experiences alongside tickets",
          "Inventory tracking with low-stock alerts",
          "Promo bundles combining ticket + merch offers",
          "Pickup-at-event or ship-to-door fulfilment flows",
        ],
      },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    description:
      "Certified connectors for messaging, analytics, finance, and marketing.",
    groups: [
      {
        title: "Partner Ecosystem",
        items: [
          "Mailgun, SendGrid, Twilio, Africa's Talking, Safaricom SMS",
          "Firebase Cloud Messaging for push notifications",
          "Google Analytics, Meta Pixel, and server-side conversions",
          "Slack alerts, Xero/QuickBooks exports, and accounting sync",
          "Marketing automation hooks for Klaviyo, HubSpot, Mailchimp",
        ],
      },
    ],
  },
  {
    id: "cms",
    title: "Content Management System",
    description:
      "Manage all text content, sections, labels, and messages across the entire platform.",
    groups: [
      {
        title: "Content Management",
        items: [
          "Edit all headings, descriptions, labels, and messages across the platform",
          "Manage content for homepage, admin dashboard, organizer portal, profile pages",
          "Support for multiple languages (i18n) with locale management",
          "Content versioning and revision history",
          "Bulk update multiple content blocks at once",
          "Search and filter content by section, category, or keyword",
        ],
      },
      {
        title: "Content Types",
        items: [
          "Text blocks for headings, descriptions, and labels",
          "HTML content for rich text sections",
          "Markdown support for formatted content",
          "JSON content for structured data",
        ],
      },
    ],
  },
  {
    id: "features",
    title: "Features Management",
    description:
      "Create and manage event features that organizers can select when creating events.",
    groups: [
      {
        title: "Feature Management",
        items: [
          "Create, edit, and delete features and feature categories",
          "Set pricing for each feature (one-time, per-ticket, per-event, per-month)",
          "Mark features as required, popular, or optional",
          "Organize features into categories (Core, Design, Ticketing, Management, Marketing, Add-ons)",
          "Enable or disable features for specific organizers or events",
          "View feature usage statistics and adoption rates",
        ],
      },
      {
        title: "Feature Configuration",
        items: [
          "Set base prices and pricing types for each feature",
          "Configure pricing units (per ticket, per event day, per month)",
          "Define feature descriptions and benefits",
          "Manage feature dependencies and requirements",
          "Set feature availability by organizer tier or subscription",
        ],
      },
    ],
  },
];

