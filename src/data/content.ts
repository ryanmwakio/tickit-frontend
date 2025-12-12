export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Features", href: "/features" },
  { label: "System", href: "/system" },
  { label: "Suites", href: "/suites" },
  { label: "Journeys", href: "/journeys" },
  { label: "Ops Desk", href: "/ops" },
  { label: "Intelligence", href: "/intelligence" },
  { label: "Organizer", href: "/organizer" },
  { label: "Admin", href: "/admin" },
];

export const heroStats = [
  {
    label: "MPesa-ready checkouts",
    value: "120k+/min",
    detail: "Seat holds, idempotent orders, fraud flags",
  },
  {
    label: "Venues onboarded",
    value: "2,400",
    detail: "Stadiums, clubs, coworking hubs, pop-ups",
  },
  {
    label: "Offline scans synced",
    value: "18M",
    detail: "Battery-safe mode + conflict resolution",
  },
  {
    label: "Experience add-ons",
    value: "350+",
    detail: "Parking, merch, meals, insurance, loyalty",
  },
];

export const featurePillars = [
  {
    id: "identity",
    title: "Identity & Trust",
    description:
      "Kenyan-first onboarding with OTP, KRA/KYC capture, device level controls, and consent records ready for the Data Protection Act.",
    metrics: ["OTP < 30s", "2FA opt-in 78%", "Audit log immutable"],
    features: [
      "Phone + email signup, OTP verification, device management, and role-based switching for attendee, organiser, promoter, and staff.",
      "Two-factor enforcement, privacy centre, exportable data trails, and marketing consent capture with granular toggles.",
      "KYC wizard with ID upload, business PIN capture, and verification status for organisers before payouts unlock.",
    ],
  },
  {
    id: "creation",
    title: "Event Creation Studio",
    description:
      "Modular builder for public, private, invite-only, and recurring events with seat maps, bundles, and contracts baked in.",
    metrics: ["5m avg launch", "Seat map UX v2", "10 ticket archetypes"],
    features: [
      "Guided wizard for title, storytelling copy, category tags, and venue GPS with Unsplash-powered hero assets.",
      "Ticket recipes for GA, VIP, dynamic pricing, promo tiers, add-ons, bundles, tax and fee splits.",
      "Draft, preview, schedule, clone, and multi-organiser co-hosting with smart checklists and compliance reminders.",
    ],
  },
  {
    id: "commerce",
    title: "Commerce & Payments",
    description:
      "MPesa Express, Paybill, Till, cards, Airtel Money, wallet credits, escrow, refunds, and resale across one consistent checkout.",
    metrics: ["Idempotency keys", "Wallet & escrow", "Chargeback guardrails"],
    features: [
      "Seat hold timers with Redis locks, idempotent checkout orchestration, and transparent fee breakdown before pay.",
      "Payment rails for MPesa, cards, bank transfer, pay-later deposits, tips, payouts scheduling, and accounting exports.",
      "Refund intelligence, auto waitlist promotions, organiser settlement ledger, and webhook verification for partners.",
    ],
  },
  {
    id: "operations",
    title: "Ops, Safety & Intelligence",
    description:
      "Live command centre for check-ins, fraud, capacity, evacuation, marketing, and insights with offline resilience.",
    metrics: ["<150ms scan", "Offline sync", "Geo-fenced alerts"],
    features: [
      "Scanner app powered by Radix primitives, duplicate detection, lost-ticket workflows, staff shifts, and RFID wristbands.",
      "Ops desk with venue heatmaps, crowd density, evacuation exports, incident logging, and status page controls.",
      "Analytics lake for funnel, attribution, resale, venue utilisation, plus AI assistants that summarise feedback and forecast demand.",
    ],
  },
];

export const suiteHighlights = [
  {
    id: "attendee",
    title: "Attendee OS",
    badge: "Discovery + Wallet",
    description:
      "Personalised discovery feed, saved organisers, MPesa-ready wallet, ticket gifting, resale, and loyalty.",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Personalised rows", value: "12 signals" },
      { label: "Passes issued", value: "4.3M" },
    ],
    modules: [
      {
        title: "Discovery",
        items: [
          "Geo-aware cards & map view",
          "Saved searches + alerts",
          "Category, price, accessibility filters",
        ],
      },
      {
        title: "Ticketing",
        items: [
          "Seat select + hold timers",
          "Group booking roster",
          "Wallet passes + screenshot watermarking",
        ],
      },
    ],
  },
  {
    id: "organiser",
    title: "Organiser Studio",
    badge: "Creation + Automation",
    description:
      "Full lifecycle workspace: event wizard, contract locker, marketing co-pilot, payouts, and analytics.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Automations", value: "48 recipes" },
      { label: "Average GTM time", value: "5m" },
    ],
    modules: [
      {
        title: "Event Ops",
        items: [
          "Recurring + multi-venue scheduling",
          "Seat maps + capacity guardrails",
          "Waitlists & auto-promotions",
        ],
      },
      {
        title: "Growth",
        items: [
          "Promo & referral tracking",
          "Abandoned cart triggers",
          "Sponsor marketplace briefs",
        ],
      },
    ],
  },
  {
    id: "operations",
    title: "Operations Command",
    badge: "Onsite + Safety",
    description:
      "Live command centre with scanners, shift management, evacuation flows, incident console, and IoT hooks.",
    image:
      "https://images.unsplash.com/photo-1454922915609-78549ad709bb?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Check-in devices", value: "3 modes" },
      { label: "Offline hours", value: "48h cache" },
    ],
    modules: [
      {
        title: "Gate Ops",
        items: [
          "Scan, verify, refund-on-gate",
          "Duplicate + fraud flags",
          "VIP/backstage routing",
        ],
      },
      {
        title: "Safety",
        items: [
          "Incident + evacuation workflows",
          "Geo-fenced alerts & SMS",
          "Venue accessibility profiles",
        ],
      },
    ],
  },
  {
    id: "intelligence",
    title: "Intelligence Cloud",
    badge: "Analytics + AI",
    description:
      "Realtime sales board, cohort explorer, channel attribution, AI pricing advisor, and scheduled reports.",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Data freshness", value: "Live + hourly" },
      { label: "Exports", value: "CSV / Excel / PDF" },
    ],
    modules: [
      {
        title: "Dashboards",
        items: [
          "Sales + refund KPIs",
          "Venue utilisation heatmaps",
          "Marketing ROAS stacked view",
        ],
      },
      {
        title: "AI copilots",
        items: [
          "Pricing & promo suggestions",
          "Feedback auto-summaries",
          "Churn & repeat-buyer predictions",
        ],
      },
    ],
  },
];

export const journeys = [
  {
    persona: "Attendee",
    focus: "Phone-first Checkout",
    signal: "MPesa + card in one UX",
    steps: [
      {
        title: "Discover",
        detail:
          "Location-smart feed, curated collections, map mode, and saved organiser spots.",
      },
      {
        title: "Configure",
        detail:
          "Select tiers, seat maps, add-ons, group names, and access promo/loyalty wallet.",
      },
      {
        title: "Pay",
        detail:
          "MPesa Express push, tokenised cards, instalments, and transparent fees with receipt PDF.",
      },
      {
        title: "Access",
        detail:
          "Dynamic QR, Apple/Google Wallet passes, gifting, transfer controls, and offline locker.",
      },
    ],
  },
  {
    persona: "Organiser",
    focus: "Launch & Grow",
    signal: "Automation-first studio",
    steps: [
      {
        title: "Plan",
        detail:
          "Event brief templates, sponsorship inventory, and compliance reminders (permits, tax).",
      },
      {
        title: "Build",
        detail:
          "Seat designer, pricing experiments, add-on catalogues, and co-host approvals.",
      },
      {
        title: "Promote",
        detail:
          "Email/SMS journeys, affiliate/referral payouts, media widgets, and social deep links.",
      },
      {
        title: "Settle",
        detail:
          "Live revenue panel, payout scheduling, reconciliation exports, and dispute workflows.",
      },
    ],
  },
  {
    persona: "Ops & Safety",
    focus: "Command Centre",
    signal: "Realtime situational awareness",
    steps: [
      {
        title: "Staffing",
        detail:
          "Shift assignments, access tokens, device provisioning, and briefing packs.",
      },
      {
        title: "Ingress",
        detail:
          "Live capacity heatmap, duplicate-detect scanners, VIP & backstage routing lanes.",
      },
      {
        title: "Incidents",
        detail:
          "Anonymous reporting, evacuation exports, geo-fenced push + SMS, partner notifications.",
      },
      {
        title: "Post-event",
        detail:
          "Lost+found desk, sentiment pulse, compliance exports, and SLA scorecards.",
      },
    ],
  },
  {
    persona: "Finance & Data",
    focus: "Reporting Cloud",
    signal: "Trusted multi-tenant analytics",
    steps: [
      {
        title: "Monitor",
        detail:
          "Sales velocity, conversion funnel, cohort retention, and marketing attribution.",
      },
      {
        title: "Investigate",
        detail:
          "Fraud anomalies, refunded orders, chargeback workflow, and audit-ready trails.",
      },
      {
        title: "Forecast",
        detail:
          "AI pricing signals, demand shaping, and venue utilisation models.",
      },
      {
        title: "Share",
        detail:
          "Scheduled reports, API access, governance logs, and partner-ready exports.",
      },
    ],
  },
];

export const opsPlaybooks = [
  {
    title: "Secondary Market Guardrails",
    detail:
      "Smart resale windows, seller reputation, organiser approvals, escrow payouts, and instant buyer protection with insurance add-ons.",
    indicators: ["Waitlist auto-match", "Cap % resale uplift", "Fraud hold"],
  },
  {
    title: "Venue Safety Stack",
    detail:
      "Accessibility profiles, safety scorecards, evacuation macros, IoT crowd density hooks, and anonymous incident channels.",
    indicators: ["Geo-fenced alerts", "Emergency exports", "Staff triggers"],
  },
  {
    title: "Marketing Automation",
    detail:
      "Promo calendar, abandoned cart journeys, referral boosts, QR street campaigns, and sponsor placements managed from one panel.",
    indicators: ["SMS cost per sale", "Promo ROI", "A/B insights"],
  },
  {
    title: "Finance & Tax Compliance",
    detail:
      "VAT + withholding calculators, payout holds for review, reconciliation checklists, and QuickBooks/Xero ready exports.",
    indicators: ["Ledger lock", "KRA-ready PDFs", "Automated holds"],
  },
];

export const insightCards = [
  {
    label: "Sales velocity",
    metric: "KES 12.4M",
    change: "+18% WoW",
    detail: "Peak demand Fri 08:00 after SMS drop. Dynamic pricing raised VIP +12%.",
  },
  {
    label: "Conversion funnel",
    metric: "62% → 18% → 7%",
    change: "+3 pts",
    detail: "Abandoned cart recovery rescued 420 orders via MPesa reminder STK push.",
  },
  {
    label: "Resale market",
    metric: "1,280 tickets",
    change: "92% verified",
    detail: "Auto waitlist filled 340 orders, scalper risk down 33% after smart windows.",
  },
  {
    label: "Sentiment pulse",
    metric: "4.8 / 5",
    change: "+0.4",
    detail: "Attendees loved AR wayfinding + shuttle tie-ins; watch notes on merch stock.",
  },
];

export const faqItems = [
  {
    question: "How do you support both Kenyan and global payment flows?",
    answer:
      "Tixhub bridges MPesa (Express, Paybill, Till), Airtel Money, tokenised cards, bank transfers, and pay-later deposits inside one orchestration layer with idempotency keys, webhook verification, payout ledgers, and automated reconciliation exports.",
  },
  {
    question: "What keeps ticketing safe from fraud or duplicate scans?",
    answer:
      "Dynamic QR payloads are HMAC signed, verified on each scan (<150ms), and paired with Redis-backed duplicate detection, device fingerprinting, seller reputation scoring, and manual review queues for high-risk flows.",
  },
  {
    question: "Can organisers run offline or low-connectivity events?",
    answer:
      "Yes. Staff apps cache manifests for 48 hours, log scans locally, and reconcile once online. Gate modes, wristband printing, and refund-on-gate can all operate offline with conflict resolution when syncing.",
  },
  {
    question: "Do you handle compliance for payouts and taxes?",
    answer:
      "KYC gating, VAT and withholding calculators, payout hold rules, audit trails, and KRA-ready exports ensure finance teams stay compliant while finance dashboards surface anomalies for review.",
  },
];


