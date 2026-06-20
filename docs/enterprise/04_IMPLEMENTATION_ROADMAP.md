# ALS Yatırım Enterprise Implementation Roadmap

This roadmap turns the enterprise vision into staged implementation work.

## Phase 0 — Current MVP Stabilization

Status: in progress in the current Next.js/Cloudflare Worker application.

Goals:

- Stabilize CRM client detail.
- Enforce Shift hierarchy scoping.
- Remove fake trading fills.
- Require broker credentials for live trading.
- Add production domain configuration.
- Add professional ALS Yatırım branding.

Exit criteria:

- Build passes.
- Admin only manages Shift.
- Client cannot see admin users/roles.
- Broker credentials are required for orders.

## Phase 1 — Production Launch on Current Stack

Target stack:

- Next.js 15
- Cloudflare Workers
- Cloudflare D1
- Broker API adapter

Tasks:

1. Connect `alsyatirim.login.org.tr`.
2. Configure `AUTH_SECRET`.
3. Configure broker secrets.
4. Apply D1 remote migrations.
5. Create production Admin.
6. Create Shift companies.
7. Configure real customer onboarding flow.
8. Add production monitoring.

Risks:

- D1 is suitable for MVP but not ideal for large enterprise scale.
- Broker API differences may require custom adapter work.
- Legal/lisensing requirements must be handled outside code.

## Phase 2 — CRM Depth

Modules:

- Customer advanced timeline.
- Customer tags.
- Assignment queues.
- Sales pipeline.
- Retention pipeline.
- Transfer workflow from Sales to Retention.
- Employee KPI dashboards.

Key deliverables:

- Customer transfer screen.
- Retention queue.
- Sales conversion reports.
- Employee performance reports.

## Phase 3 — Finance & Wallet

Modules:

- Wallets.
- Deposits.
- Withdrawals.
- Transactions.
- Bonuses.
- Commissions.
- Finance approvals.

Key deliverables:

- Double-entry ledger.
- Deposit approval workflow.
- Withdrawal approval workflow.
- Finance dashboard.
- Customer wallet page.

## Phase 4 — KYC / AML / Compliance

Modules:

- Documents.
- Verification status.
- AML checks.
- Compliance review.
- Risk profile.
- Suitability test.

Key deliverables:

- KYC case screen.
- Document review.
- AML provider adapter.
- Compliance decisions.
- Risk disclosure acceptance.

## Phase 5 — Market Data

Providers:

- TradingView
- Finnhub
- Polygon
- AlphaVantage
- Binance
- BIST

Key deliverables:

- Market data adapter interface.
- Quote cache.
- Symbol catalog.
- Economic calendar.
- Market widgets for homepage.
- Order book feed where provider supports it.

## Phase 6 — Broker Production Hardening

Tasks:

- Broker-specific adapter.
- Order lifecycle callbacks.
- Order cancel/modify.
- Execution reports.
- Margin/risk checks.
- Idempotent broker events.
- Broker audit records.

Exit criteria:

- No local fake fills.
- Broker event reconciliation works.
- All order states audited.

## Phase 7 — Multi Brand

Tasks:

- Brand model.
- Brand domain routing.
- Brand theme.
- Brand homepage.
- Brand SEO.
- Brand campaign isolation.
- Database-per-brand or schema-per-brand strategy.

Exit criteria:

- Brand A/B/C/D can run independently.
- Each brand has its own homepage and CRM segmentation.

## Phase 8 — Homepage Builder & CMS

Blocks:

- Hero
- Slider
- Market Widget
- News Widget
- Blog Widget
- CTA
- Header
- Footer

Deliverables:

- Drag/drop block builder.
- Versioned publishing.
- Preview mode.
- SEO editor.
- Media library.

## Phase 9 — Ticket & Support

Tasks:

- Ticket categories.
- Ticket priorities.
- Ticket attachments.
- Ticket SLA.
- Live support routing.
- Client portal ticket view.

Exit criteria:

- Client can create support/tickets.
- Responsible employee and TL see scoped messages.
- Support can escalate.

## Phase 10 — Affiliate

Tasks:

- Partner accounts.
- Referral links.
- Click tracking.
- Conversion tracking.
- Revenue tracking.
- Commission calculation.
- Partner payout.

## Phase 11 — AI

Modules:

- AI Lead Scoring.
- AI Customer Analysis.
- AI Risk Engine.
- AI CRM Assistant.
- AI Campaign Optimization.
- AI Ticket Assistant.

Rules:

- AI results must be explainable.
- Human approval required for customer-impacting actions.
- AI prompts and outputs must be audited.

## Phase 12 — Microservice Migration

Target:

- .NET 9 microservices.
- PostgreSQL.
- Redis.
- ElasticSearch.
- RabbitMQ.
- Kubernetes.

Migration approach:

1. Extract AuthService.
2. Extract CustomerService.
3. Extract Employee/RBAC services.
4. Extract FinanceService.
5. Extract Trading/Broker services.
6. Extract KYC/AML services.
7. Extract CMS/Homepage services.
8. Move reporting to ReportService.

## Phase 13 — Mobile Apps

Targets:

- iOS.
- Android.

Modules:

- Customer login.
- Wallet.
- KYC.
- Support.
- Notifications.
- Trading.

## Engineering Principles

- No fake broker fills in production.
- Every sensitive action is audited.
- Client cannot see other users.
- Shift/company isolation is mandatory.
- Timezone handling is user-based.
- Finance must be ledger-backed.
- KYC/AML decisions are immutable.
- Broker integration must be idempotent.
