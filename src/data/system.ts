export const highLevelGoals = [
  {
    title: "Multi-tenant SaaS",
    description:
      "Row-level security and white-label theming for organisers, with clear payout separation and auditing.",
    stats: ["Tenant RLS", "Custom domains", "Feature flags per tenant"],
  },
  {
    title: "Kenyan-first payments",
    description:
      "MPesa Express, Paybill, Till, Airtel Money, pay-on-arrival escrow, NET-30 corporate invoicing, and reconciliation exports.",
    stats: ["MPesa Express", "Pay-later", "Escrow"],
  },
  {
    title: "Offline-resilient ops",
    description:
      "Scanner apps with local manifests, retry queues, Redis-backed seat holds, and safety workflows for crowd control.",
    stats: ["<150ms scan", "48h offline cache", "Duplicate detection"],
  },
  {
    title: "Secondary market & trust",
    description:
      "Smart resale limits, seller reputation, biometric options, fraud queues, and incident reporting dashboards.",
    stats: ["Fraud AI", "Escrow resale", "Incident center"],
  },
];

export const architectureLayers = [
  {
    layer: "Clients",
    description:
      "Next.js web app, React Native mobile, staff scanners (PWA/native), and third-party portals using the API.",
    bullets: [
      "Shared design tokens + component library across web/mobile.",
      "Scanner app supports offline mode, manifests, and battery saver.",
      "Partner widgets & white-label portals consume public APIs.",
    ],
  },
  {
    layer: "Access & Gateway",
    description:
      "API gateway managing TLS termination, JWT auth, rate limiting, WAF, SLA routing.",
    bullets: [
      "REST + GraphQL surfaces with idempotency support.",
      "Traffic segmentation by tenant + role for throttling/quotas.",
      "Hooks to observability stack for request tracing.",
    ],
  },
  {
    layer: "Core Services",
    description:
      "Auth, catalog, ticketing, payments, resale, check-in, notifications, analytics, media, admin.",
    bullets: [
      "Each service owns schema + migrations, communicates via gRPC/REST.",
      "Kafka topics propagate booking events, payouts, fraud alerts.",
      "Workers run long-running jobs (receipts, exports, scoring).",
    ],
  },
  {
    layer: "Data & Infra",
    description:
      "PostgreSQL, Redis, Kafka, Elastic, S3, data lake (Snowflake/ClickHouse), Prometheus/Grafana, ELK.",
    bullets: [
      "Row-level security for multi-tenant data isolation.",
      "Redis for seat holds, device sessions, rate limiting.",
      "Data lake receives event streams for BI and AI.",
    ],
  },
];

export const serviceMatrix = [
  {
    name: "Auth & Identity",
    focus: "Account lifecycle, KYC, session/device management, MFA.",
    endpoints: [
      "POST /auth/signup",
      "POST /auth/login",
      "POST /auth/verify-phone",
      "POST /auth/social",
    ],
  },
  {
    name: "Event Catalog",
    focus: "Event CRUD, venues, seat maps, tags, search indexing.",
    endpoints: [
      "GET /events",
      "POST /organisers/{id}/events",
      "PUT /events/{id}",
      "GET /events/{id}",
    ],
  },
  {
    name: "Ticketing & Inventory",
    focus:
      "Seat holds, ticket issuance, transfers, lifecycle state machine, QR generation.",
    endpoints: [
      "POST /checkout",
      "POST /tickets/{id}/transfer",
      "POST /orders/{id}/resend",
    ],
  },
  {
    name: "Payments & Finance",
    focus:
      "MPesa/card orchestration, settlement ledger, refunds, chargebacks, payouts.",
    endpoints: [
      "POST /payments/mpesa/express",
      "POST /payments/mpesa/confirm",
      "POST /payments/card",
      "POST /webhooks/{provider}",
    ],
  },
  {
    name: "Resale & Marketplace",
    focus: "Ticket listings, waitlist matching, escrow, reputation scoring.",
    endpoints: [
      "POST /resale/list",
      "GET /resale/listings",
      "POST /resale/{listing_id}/buy",
    ],
  },
  {
    name: "Check-in & Ops",
    focus: "Scanner APIs, manifest download, duplicate detection, incident logs.",
    endpoints: [
      "POST /scanner/scan",
      "POST /scanner/batch-scan",
      "GET /events/{id}/manifest",
    ],
  },
  {
    name: "Notification & Comms",
    focus: "Email/SMS/push/USSD campaigns, consent tracking, templates.",
    endpoints: ["POST /notifications/send", "POST /notifications/batch"],
  },
  {
    name: "Analytics & Reporting",
    focus: "Dashboards, exports, APIs for BI, scheduled delivery.",
    endpoints: ["GET /analytics/summary", "POST /reports/schedule"],
  },
];

export const storageStack = [
  {
    title: "PostgreSQL clusters",
    details: [
      "Shared cluster with tenant_id + RLS for MVP, upgrade to schema-per-tenant for premium organisers.",
      "PgBouncer / Supavisor for connection pooling.",
    ],
  },
  {
    title: "Redis",
    details: [
      "Seat holds, rate limiting, session store, duplicate scan cache, OTP state.",
    ],
  },
  {
    title: "Kafka / RabbitMQ",
    details: [
      "Topics for order events, payouts, notifications, analytics ingestion.",
    ],
  },
  {
    title: "Elastic / OpenSearch",
    details: [
      "Full-text search, autocomplete, analytics dashboards for ops teams.",
    ],
  },
  {
    title: "S3-compatible storage",
    details: ["Event media, PDF tickets, invoices, compliance documents."],
  },
  {
    title: "Data lake + BI",
    details: [
      "Parquet on S3 + Snowflake/ClickHouse to power reporting, AI pricing, cohort views.",
    ],
  },
];

export const dataModel = [
  {
    entity: "users",
    fields:
      "id, name, email, phone, password_hash, role, verified, wallet_balance, created_at, updated_at",
    notes: "RLS keyed by tenant; device tokens + multi-factor secrets stored encrypted.",
  },
  {
    entity: "events",
    fields:
      "id, organiser_id, title, description, category, venue_id, timezone, start_datetime, end_datetime, status, created_at",
    notes: "Link to seat_maps, ticket_types, marketing metadata.",
  },
  {
    entity: "ticket_types",
    fields:
      "id, event_id, name, price_cents, currency, capacity, seatmap_id, start_sale, end_sale, refundable",
    notes: "Supports dynamic pricing + add-on metadata JSONB.",
  },
  {
    entity: "orders + order_items",
    fields:
      "order totals, status, idempotency_key, payment_method, breakdown of fees",
    notes: "Order items reference ticket_type and hold state.",
  },
  {
    entity: "tickets",
    fields:
      "id, order_item_id, code_uuid, qr_payload, status, issued_at, transferred_from_ticket_id",
    notes: "QR payloads signed (HMAC) and rotated.",
  },
  {
    entity: "payments + refunds",
    fields:
      "provider_txn_id, status, settled_at, reconciliation markers, retry counts",
    notes: "Ledger tables for organiser payouts, escrow, and wallet transactions.",
  },
  {
    entity: "checkins",
    fields: "ticket_id, gate_id, scanner_user_id, scanned_at, result",
    notes: "Dup detection using Redis set keyed by event + ticket.",
  },
  {
    entity: "audit_logs",
    fields: "actor_id, action, target_type, target_id, metadata, timestamp",
    notes: "Immutable store for compliance.",
  },
];

export const apiSurface = [
  {
    group: "Authentication",
    endpoints: [
      "POST /auth/signup",
      "POST /auth/login",
      "POST /auth/refresh",
      "POST /auth/verify-phone",
      "POST /auth/social",
    ],
  },
  {
    group: "Events & Catalog",
    endpoints: [
      "GET /events",
      "GET /events/{id}",
      "POST /organisers/{id}/events",
      "PUT /events/{id}",
    ],
  },
  {
    group: "Checkout & Tickets",
    endpoints: [
      "POST /checkout",
      "GET /orders/{id}",
      "POST /orders/{id}/resend",
      "POST /tickets/{ticket_id}/transfer",
    ],
  },
  {
    group: "Payments",
    endpoints: [
      "POST /payments/mpesa/express",
      "POST /payments/mpesa/confirm",
      "POST /payments/card",
      "POST /webhooks/{provider}",
    ],
  },
  {
    group: "Resale",
    endpoints: [
      "POST /resale/list",
      "GET /resale/listings",
      "POST /resale/{listing_id}/buy",
    ],
  },
  {
    group: "Check-in",
    endpoints: [
      "POST /scanner/scan",
      "POST /scanner/batch-scan",
      "GET /events/{id}/manifest",
    ],
  },
  {
    group: "Admin & Ops",
    endpoints: [
      "GET /admin/audit",
      "POST /admin/payouts/{organiser}/approve",
      "POST /notifications/send",
    ],
  },
];

export const sequenceFlows = [
  {
    title: "Checkout / Purchase",
    steps: [
      "Client fetches event details + ticket types.",
      "POST /checkout with idempotency key; seat hold stored in Redis.",
      "Pending order persisted; Payments service initiates MPesa/card request.",
      "Webhook callback validates signature; payment marked successful/failed.",
      "Ticketing issues QR, notifies Notification service, releases holds if failure.",
    ],
  },
  {
    title: "Scanner / Check-in",
    steps: [
      "Staff authenticates; downloads manifest snapshot for offline access.",
      "Scan request validates HMAC QR, checks Redis duplicate cache.",
      "Check-in service marks ticket, pushes to Kafka topic for analytics.",
      "Offline scans stored locally and synced via POST /scanner/batch-scan.",
    ],
  },
  {
    title: "Resale",
    steps: [
      "Seller lists ticket; Ticketing locks ticket (listed_locked state).",
      "Buyer checkout uses same checkout flow, paying resale price.",
      "Ownership transfers; seller payout triggered via Payments ledger.",
      "Original QR invalidated, replacement issued to buyer.",
    ],
  },
];

export const securityChecklist = [
  "TLS everywhere, strict CORS, WAF rules for checkout and auth.",
  "JWT access tokens (short-lived) + refresh tokens; device revocation endpoints.",
  "Column-level encryption for PII and payment tokens.",
  "Signed QR payloads with rotation + duplicate scan detection.",
  "Rate limiting on payment/checkout endpoints, bot detection for launches.",
  "Immutable audit logs for financial actions and admin changes.",
  "Consent + DPA compliance: export/delete workflows, marketing toggles.",
  "Disaster recovery: PITR for Postgres, S3 snapshots, multi-region plan.",
];

export const roadmap = [
  {
    phase: "MVP (0–3 months)",
    focus: [
      "Event CRUD, ticket types, seat holds, MPesa/card checkout.",
      "QR issuance, simple online scanner, organiser dashboard.",
      "Email/SMS notifications, shared DB with tenant_id.",
    ],
  },
  {
    phase: "Phase 2 (3–9 months)",
    focus: [
      "Offline scanner sync, refunds, resale marketplace.",
      "Advanced analytics, promo/marketing suite, wallet.",
      "Social features, improved fraud signals.",
    ],
  },
  {
    phase: "Phase 3 (9–18 months)",
    focus: [
      "USSD buy flow, pay-later, kiosk/offline box office.",
      "White-label theming, IoT integrations, dynamic pricing.",
      "Advanced fraud + insurance, AI insights.",
    ],
  },
  {
    phase: "Phase 4 (18+ months)",
    focus: [
      "Blockchain provenance optional module, AR maps, sponsorship marketplace.",
      "API marketplace + governance board tooling.",
    ],
  },
];

export const failureModes = [
  {
    title: "Oversell / race conditions",
    mitigations: [
      "Redis locks for seat holds, expiry TTL job, idempotency keys on checkout.",
    ],
  },
  {
    title: "Payment webhook failure",
    mitigations: [
      "Retry with exponential backoff, signature verification, idempotent handlers.",
    ],
  },
  {
    title: "Network outage during check-in",
    mitigations: [
      "Offline manifest cache, local queue for scans, conflict resolution sync API.",
    ],
  },
  {
    title: "Fraud / bot surge",
    mitigations: [
      "Rate limiting, device fingerprinting, velocity rules, manual review queues.",
    ],
  },
];

