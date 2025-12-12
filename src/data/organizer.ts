export type OrganizerSection = {
  id: string;
  title: string;
  description: string;
  badge?: string;
};

export type OrganizerRole = {
  title: string;
  description: string;
  responsibilities: string[];
  badge: string;
};

export type OrganizerDashboardCluster = {
  title: string;
  description: string;
  items: string[];
};

export type OrganizerModuleGroup = {
  title: string;
  items: string[];
  badge?: string;
};

export type OrganizerModule = {
  id: string;
  title: string;
  description: string;
  groups: OrganizerModuleGroup[];
  badge?: string;
};

export type OrganizerStat = {
  label: string;
  value: string;
  change: string;
  context: string;
};

export type OrganizerInsight = {
  title: string;
  metric: string;
  change: string;
  description: string;
};

export type OrganizerChartSeries = {
  title: string;
  value: string;
  change: string;
  points: number[];
  accent: string;
  frequency: string;
};

export const organizerSections: OrganizerSection[] = [
  {
    id: "dashboard",
    badge: "Overview",
    title: "Organizer Dashboard",
    description:
      "Live business overview spanning events, sales, marketing, operations, and support queues.",
  },
  {
    id: "events",
    badge: "Studio",
    title: "Event Management",
    description:
      "Creation wizard, venue tools, seat maps, sponsors, livestream toggles, and visibility.",
  },
  {
    id: "tickets",
    badge: "Inventory",
    title: "Ticket Management",
    description:
      "Ticket types, pricing, inventory guardrails, promotions, and manual operations.",
  },
  {
    id: "orders",
    badge: "CRM",
    title: "Orders & Customers",
    description:
      "Customer timelines, refunds, delivery, notes, and collaboration with finance/support.",
  },
  {
    id: "checkins",
    badge: "Ops",
    title: "Check-in & Gate Control",
    description:
      "Device management, gate throughput, duplicate detection, and offline-first scanners.",
  },
  {
    id: "staff",
    badge: "Identity",
    title: "Staff & Access Control",
    description:
      "Role-based access, invites, device/IP logs, and gate-only or finance-only permissions.",
  },
  {
    id: "finance",
    badge: "Money",
    title: "Finance & Settlement",
    description:
      "Organizer wallet, payouts, VAT, commissions, chargebacks, and transaction health.",
  },
  {
    id: "marketing",
    badge: "Growth",
    title: "Marketing Suite",
    description:
      "Promo codes, affiliates, campaigns, segmentation, and ROI across SMS/email/push.",
  },
  {
    id: "analytics",
    badge: "Intelligence",
    title: "Analytics & Reports",
    description:
      "Real-time dashboards, cohort analytics, seat map heatmaps, and export-ready packs.",
  },
  {
    id: "support",
    badge: "Care",
    title: "Support & Help Desk",
    description:
      "In-portal chat, ticketing, SLAs, knowledgebase, and delivery or refund issues.",
  },
  {
    id: "chat",
    badge: "Live",
    title: "Live Chat Management",
    description:
      "Manage customer chat sessions, respond to inquiries, and monitor bot interactions.",
  },
  {
    id: "integrations",
    badge: "Ecosystem",
    title: "Integrations",
    description:
      "Payment rails, marketing tools, business systems, and automation via API/webhooks.",
  },
  {
    id: "settings",
    badge: "Control",
    title: "Organizer Settings",
    description:
      "Branding, account data, domain mapping, API keys, webhook governance, notifications.",
  },
  {
    id: "bonus",
    badge: "Next-gen",
    title: "Bonus Features",
    description:
      "Dynamic seat maps, GPS tracking, NFT tickets, smart fraud, artist payout splits, insurance.",
  },
];

export const organizerDashboardStats: OrganizerStat[] = [
  {
    label: "Tickets sold today",
    value: "12,480",
    change: "+14% vs yesterday",
    context: "Peak 08:10 after SMS blast",
  },
  {
    label: "Gross revenue",
    value: "KES 18.6M",
    change: "+9% WoW",
    context: "MPesa 62%, Card 24%, Bank 10%",
  },
  {
    label: "Outstanding payouts",
    value: "KES 6.4M",
    change: "3 organisers pending",
    context: "Soundwave pending KYC",
  },
  {
    label: "Check-in rate",
    value: "87%",
    change: "+5 pts day",
    context: "VIP lanes fastest (92%)",
  },
];

export const organizerDashboardSales: OrganizerInsight[] = [
  {
    title: "Dynamic pricing impact",
    metric: "+KES 1.2M",
    change: "+12% VIP uplift",
    description:
      "Tier auto-switch triggered at 70% capacity for Nairobi Gala; next tier scheduled for 6pm.",
  },
  {
    title: "Affiliate contribution",
    metric: "18% of sales",
    change: "+4 pts vs last week",
    description:
      "Top promoters: Kulture Labs, Nightshift, Tribe Agency. Most conversions via QR street campaign.",
  },
  {
    title: "Promo codes",
    metric: "KES 840k redeemed",
    change: "Usage 62%",
    description:
      "VIPTHANKS code driving high AOV; cap of 1,000 codes expected to hit before midnight.",
  },
];

export const organizerOpsSignals: OrganizerInsight[] = [
  {
    title: "Gate throughput",
    metric: "1,240 scans / 15m",
    change: "Vip Gate 1 warning",
    description:
      "Offline queue syncing for Gate 1; recommend device swap or hotspot backup before doors open.",
  },
  {
    title: "Fraud alerts",
    metric: "32 flagged orders",
    change: "12 high risk",
    description:
      "Mostly duplicate MPesa receipts across two concerts; refunds paused pending finance review.",
  },
  {
    title: "Support backlog",
    metric: "24 open issues",
    change: "8 SLA breaches",
    description:
      "Delivery failures via Airtel SMS aggregator; failover to fallback sender recommended.",
  },
];

export const organizerChartSeries: OrganizerChartSeries[] = [
  {
    title: "Ticket velocity",
    value: "42.8k sold",
    change: "+18% vs last week",
    points: [12, 16, 18, 25, 22, 28, 32, 35],
    accent: "text-rose-500",
    frequency: "Rolling 8 days",
  },
  {
    title: "Revenue capture",
    value: "KES 28.4M",
    change: "+11% WoW",
    points: [18, 20, 23, 25, 29, 31, 33, 34],
    accent: "text-amber-500",
    frequency: "Daily net settlement",
  },
  {
    title: "Marketing ROI",
    value: "4.3x blended",
    change: "+0.6 uplift",
    points: [2.9, 3.1, 3.4, 3.8, 4.1, 4.0, 4.5, 4.3],
    accent: "text-emerald-500",
    frequency: "Channel mix (SMS + affiliates + ads)",
  },
];

export const organizerRoles: OrganizerRole[] = [
  {
    title: "Event Owners",
    badge: "Strategy",
    description:
      "Approve budgets, partnerships, insurance, and demand the full business pulse on every show.",
    responsibilities: [
      "Monitor sales velocity, payouts, and compliance sign-offs.",
      "Lock or unblock event launches, seat maps, and pricing approvals.",
      "Review sponsor packages, insurance, and artist payout splits.",
    ],
  },
  {
    title: "Event Managers",
    badge: "Execution",
    description:
      "Design experiences end-to-end—copy, lineup, venues, bundles, capacity, and promo calendars.",
    responsibilities: [
      "Launch and edit events, seat maps, add-ons, bundles, and automations.",
      "Coordinate staff rosters, vendors, and on-site ops with live dashboards.",
      "Own marketing levers: promo codes, affiliates, SMS/email journeys.",
    ],
  },
  {
    title: "Door Staff & Scanners",
    badge: "Ingress",
    description:
      "Need rugged, offline-first tooling that stays fast at peak MPesa hour and low-connectivity venues.",
    responsibilities: [
      "Scan tickets with duplicate detection and fraud alerts under 150ms.",
      "Sync offline sessions, manage device access, and follow gate playbooks.",
      "Raise incidents or refund-on-gate with audit logs.",
    ],
  },
  {
    title: "Finance Managers",
    badge: "Revenue",
    description:
      "Handle payouts, reconciliation, VAT, commission splits, and chargebacks across MPesa, bank, and card rails.",
    responsibilities: [
      "View gross/net revenue, VAT, withholding, commissions, and fees.",
      "Approve withdrawals, manage payout schedules, and export statements.",
      "Investigate failed payments, disputes, and fraud queues.",
    ],
  },
  {
    title: "Marketing & Promoters",
    badge: "Growth",
    description:
      "Run promo codes, influencer links, street teams, and QR campaigns with ROI dashboards tied to MPesa conversions.",
    responsibilities: [
      "Spin up affiliate links, pay promoters, and share branded landing pages.",
      "Launch segmented SMS/email/push campaigns and track conversion.",
      "Share social-ready posters, auto post to Meta/Google, and manage QR drops.",
    ],
  },
  {
    title: "Support & CX",
    badge: "Care",
    description:
      "Resolve refunds, delivery failures, disputes, and walk ticket buyers through every channel.",
    responsibilities: [
      "Search orders, resend tickets, edit attendee data, and log issues.",
      "Collaborate with finance on partial refunds and settlements.",
      "Respond from knowledgebase articles, macros, or in-portal chat.",
    ],
  },
];

export const organizerDashboardClusters: OrganizerDashboardCluster[] = [
  {
    title: "Event Overview",
    description: "Lifecycle snapshots for every show plus approval states.",
    items: [
      "Upcoming, draft, live, past, cancelled, and approval queues.",
      "Tickets remaining and capacity guardrails per venue.",
      "Check-in rate, best-selling events, and lineup readiness.",
    ],
  },
  {
    title: "Sales & Revenue",
    description: "Live cash view mixing MPesa, card, bank, and cash desk.",
    items: [
      "Tickets sold today, revenue YTD, and outstanding payouts.",
      "Dynamic pricing alerts and tier auto-switch status.",
      "Refund queues, pending payouts, and commission visibility.",
    ],
  },
  {
    title: "Marketing Pulse",
    description: "Tie every promo shilling to tickets, conversion, and ROI.",
    items: [
      "Promo and affiliate performance, channel ROI, and top links.",
      "Email/SMS/push campaign outcomes and spend.",
      "Audience segments responding best (VIP, frequent, geo).",
    ],
  },
  {
    title: "Operational Health",
    description: "Ops desk covering gates, staff, support, and fraud.",
    items: [
      "Gate throughput, duplicate scans, and device sync health.",
      "Pending customer issues, refunds, and SLA timers.",
      "Staff activity logs, access violations, and fraud alerts.",
    ],
  },
];

export const organizerModules: OrganizerModule[] = [
  {
    id: "events",
    title: "Event Management",
    badge: "Studio",
    description:
      "Creation wizard, seat maps, sponsors, livestream toggles, and advanced visibility for Kenyan venues.",
    groups: [
      {
        title: "Creation Wizard",
        items: [
          "Name, description, categories, tags, lineup, and agenda builder.",
          "Start/end time with multi-day & recurring schedules.",
          "Age restrictions, dress code, promo video + gallery upload.",
          "Public, private, or invite-only visibility with SEO tools.",
        ],
      },
      {
        title: "Venue & Layout",
        items: [
          "Venue database with Google Maps + traffic cues.",
          "Custom venue creation with compliance checklist.",
          "Seat map builder (SVG/JSON upload, pricing zones).",
          "Livestream toggles, sponsor placement, and stage plans.",
        ],
      },
      {
        title: "Advanced Controls",
        items: [
          "Dynamic pricing based on time or quantity sold.",
          "Capacity limits, approval workflows, and audit logs.",
          "Auto-sync to marketing channels + embeddable widgets.",
        ],
      },
    ],
  },
  {
    id: "tickets",
    title: "Ticket Management",
    badge: "Inventory",
    description:
      "Ticket recipes that cover Early Bird to NFTs with manual ops for comps, transfers, and PDF themes.",
    groups: [
      {
        title: "Ticket Types & Settings",
        items: [
          "Early Bird, Standard, VIP, VVIP, Backstage, Reserved, Free, Promo.",
          "Price, launch/end, per-person caps, fees, commission visibility.",
          "Custom ticket fields, PDF templates, branding, and add-ons.",
        ],
      },
      {
        title: "Inventory Guardrails",
        items: [
          "Caps per category and total event limit with warnings.",
          "Automatic tier switching, pausing sales, blocking tickets.",
          "Realtime stock indicators across channels and seat maps.",
        ],
      },
      {
        title: "Operations",
        items: [
          "Issue manual tickets, void, resend via SMS/email.",
          "Complimentary tickets, sponsorship bundles, transfer ownership.",
          "Full ticket exports (CSV/PDF) and audit trails.",
        ],
      },
    ],
  },
  {
    id: "orders",
    title: "Orders & Customers",
    badge: "CRM",
    description:
      "Customer-first tooling to search, edit, refund, and collaborate on every order.",
    groups: [
      {
        title: "Customer Profiles",
        items: [
          "Unified timeline: purchases, check-ins, support notes.",
          "PDF downloads, resend tickets, block customers, edit contacts.",
          "MPesa + card reference numbers linked for easy investigations.",
        ],
      },
      {
        title: "Order Workbench",
        items: [
          "Search by name, phone, order ID, ticket number, QR payload.",
          "Change order status, partial refunds, and split payments.",
          "Internal notes, attachments, and escalation routing.",
        ],
      },
    ],
  },
  {
    id: "checkins",
    title: "Check-in & Gate Control",
    badge: "Ops",
    description:
      "Live ingress dashboard, offline-first scanners, device governance, and gate-level rules.",
    groups: [
      {
        title: "Realtime Dashboard",
        items: [
          "Scans per gate/staff with duplicate + fraud alerts.",
          "Offline upload status & battery-safe health.",
          "VIP, backstage, and re-entry flags in one panel.",
        ],
      },
      {
        title: "Device & Gate Management",
        items: [
          "Register/remove scanning devices, set permissions.",
          "Assign staff per gate, restrict ticket types per lane.",
          "Pair QR scanner app, enforce firmware versions, remote wipe.",
        ],
      },
    ],
  },
  {
    id: "staff",
    title: "Staff & Access Control",
    badge: "Identity",
    description:
      "Role-based access matching Kenyan promoter setups with detail-level permissions.",
    groups: [
      {
        title: "Roles",
        items: [
          "Event Owner, Event Manager, Finance, Marketing, Door Staff, Promoter.",
          "Permissions for view-only, edit, finances, staff, analytics, gate-only.",
          "Assign per event or global plus expiry timers for agencies.",
        ],
      },
      {
        title: "Operations",
        items: [
          "Invite staff via email/SMS, revoke, or reassign.",
          "Activity logs with device/IP metadata and geo alerts.",
          "Staff shift planner and briefing packs.",
        ],
      },
    ],
  },
  {
    id: "finance",
    title: "Finance & Settlement",
    badge: "Money",
    description:
      "MPesa-first revenue cockpit with wallets, statements, VAT calculators, and dispute tooling.",
    groups: [
      {
        title: "Revenue Overview",
        items: [
          "Gross/net revenue, fees, commission, VAT, withholding.",
          "Payment channel breakdown: MPesa, bank, card, Airtel, PayPal, cash.",
          "Artist payout splits and auto-allocation for co-produced events.",
        ],
      },
      {
        title: "Settlement Tools",
        items: [
          "Organizer wallet with pending and available balances.",
          "Withdrawal requests, payout schedules, bank account settings.",
          "MPesa Till/Paybill onboarding, statement PDFs, export to CSV/XLSX.",
        ],
      },
      {
        title: "Transactions & Risk",
        items: [
          "Transaction logs, failed/pending payments, chargebacks.",
          "Fraud detection queue with smart flags and holds.",
          "Dispute workflows tied to support tickets and compliance.",
        ],
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing Suite",
    badge: "Growth",
    description:
      "Promo codes, affiliate payouts, campaigns, segmentation, and social automation.",
    groups: [
      {
        title: "Promo & Affiliate",
        items: [
          "Fixed/percent codes with usage & user limits + scheduling.",
          "Affiliate link generator with commissions, payout ledger, promoter logins.",
          "QR-based promoter campaigns and shareable poster kits.",
        ],
      },
      {
        title: "Campaign Tools",
        items: [
          "Bulk SMS/email/push with templates & cost tracking.",
          "Audiences: previous buyers, VIP, frequent, geo, cart abandoners.",
          "Auto-post to social, create custom event pages, WhatsApp share links.",
        ],
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Reports",
    badge: "Intelligence",
    description:
      "Live dashboards, cohort analysis, seat map heatmaps, and export-ready finance packs.",
    groups: [
      {
        title: "Sales & Customers",
        items: [
          "Real-time, hourly, daily sales and conversion funnels.",
          "Revenue per ticket type, payment method, cart abandonment.",
          "New vs returning buyers, top spenders, geo and demographic insights.",
        ],
      },
      {
        title: "Event & Check-in Performance",
        items: [
          "View-to-purchase rate, marketing attribution, affiliate share.",
          "Seat map heatmaps and demand per zone.",
          "Check-in trends, gate throughput, device performance, fraud attempts.",
        ],
      },
      {
        title: "Finance Reports",
        items: [
          "Settlement statements, tax breakdowns, refund summaries.",
          "Scheduled exports to PDF/CSV/XLSX or API access.",
          "KRA-ready outputs and QuickBooks/Xero integrations.",
        ],
      },
    ],
  },
  {
    id: "support",
    title: "Support & Help Desk",
    badge: "Care",
    description:
      "Blend self-service, support tickets, chat, and SLA automation for Kenyan events.",
    groups: [
      {
        title: "Service Desk",
        items: [
          "In-portal chat, support ticket creation, SLAs, and macros.",
          "Issue tracking for refunds, failed payments, delivery failures.",
          "Attach recordings, docs, and collaborate with finance or ops.",
        ],
      },
      {
        title: "Self-Service",
        items: [
          "Knowledgebase, FAQs, and video tutorials for staff & fans.",
          "Status pages for MPesa rails, scanners, and marketing systems.",
          "Issue logging for customers + organiser notifications.",
        ],
      },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    badge: "Ecosystem",
    description:
      "Plug into Kenyan-first payments plus global marketing, finance, and automation stacks.",
    groups: [
      {
        title: "Payments",
        items: [
          "MPesa STK, Paybill, Till, Airtel Money, cards, bank transfer.",
          "PayPal, Flutterwave, split settlements, escrow.",
          "Offline cash desk with reconciliation hooks.",
        ],
      },
      {
        title: "Marketing & Business",
        items: [
          "Mailchimp, HubSpot, WhatsApp Business API, Meta Pixel, Google Analytics.",
          "QuickBooks, Xero, Slack, Zapier for workflows.",
          "Webhooks + API keys with scopes for custom apps.",
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "Organizer Settings",
    badge: "Control",
    description:
      "Everything to brand, secure, and govern an organiser workspace.",
    groups: [
      {
        title: "Account & Branding",
        items: [
          "Business details, KYC verification, compliance reminders.",
          "Logo, colors, email themes, domain mapping.",
          "Notification preferences and SMS sender IDs.",
        ],
      },
      {
        title: "Developer Hooks",
        items: [
          "API keys per environment with scopes and expiry.",
          "Webhook settings with retry + signature verification.",
          "Audit feeds for third-party integrations.",
        ],
      },
    ],
  },
];

export const organizerBonusHighlights = [
  {
    title: "Dynamic Seat Map Editor",
    detail:
      "Drag-and-drop zones, pricing presets, accessibility indicators, and sponsorship overlays.",
  },
  {
    title: "Event Staff GPS Tracking",
    detail:
      "Optional GPS opt-in for field teams, shift accountability, and emergency dispatch.",
  },
  {
    title: "Smart Fraud Engine",
    detail:
      "AI-powered behavior scoring, MPesa anomaly detection, and auto escalations.",
  },
  {
    title: "Offline-first QR Scanning",
    detail:
      "48-hour device cache, conflict resolution, and recovery dashboards.",
  },
  {
    title: "NFT & Premium Tickets",
    detail:
      "On-chain ticket unlocks for collectors, sponsorships, and VIP loyalty.",
  },
  {
    title: "Automated Artist Payout Splits",
    detail:
      "Rule-based revenue shares per show, performer, or label with auto statements.",
  },
  {
    title: "Event Insurance Integration",
    detail:
      "Offer optional cover for cancellations, gear, or attendee protection with instant quotes.",
  },
];

