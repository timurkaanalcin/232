# ALS Yatırım Database Bible

This document defines the target PostgreSQL enterprise database catalogue. Current MVP uses Cloudflare D1, but the enterprise target is PostgreSQL with schema separation and optional database-per-brand.

## 1. Database Strategy

| Layer | Target |
|-------|--------|
| OLTP | PostgreSQL |
| Cache | Redis |
| Search | ElasticSearch |
| Events | RabbitMQ |
| Audit archive | PostgreSQL partitioning + cold storage |
| Multi-brand | Database per brand or schema per brand depending on deployment size |

## 2. Naming Conventions

- Tables: `snake_case`, plural.
- Primary key: `id uuid`.
- Timestamps: `created_at`, `updated_at`, `deleted_at`.
- Tenant/brand key: `brand_id uuid`.
- Soft delete where legal/operationally required.
- Money columns: `numeric(18, 6)`.
- External references: `external_id`, `provider`, `provider_ref`.

## 3. Core Tables

### 3.1 Authentication & Identity

| # | Table | Purpose |
|---|-------|---------|
| 1 | users | Core login identity. |
| 2 | user_profiles | Profile, locale, timezone, country. |
| 3 | user_credentials | Password hashes, password metadata. |
| 4 | sessions | Active sessions. |
| 5 | refresh_tokens | Refresh token storage and rotation. |
| 6 | devices | Registered devices. |
| 7 | device_sessions | Device-session relationship. |
| 8 | password_reset_tokens | Password reset flow. |
| 9 | email_verification_tokens | Email verification. |
| 10 | two_factor_secrets | Google Authenticator/TOTP secrets. |
| 11 | two_factor_recovery_codes | Backup recovery codes. |
| 12 | login_attempts | Login attempt log. |
| 13 | ip_whitelists | IP allowlist by user/role/brand. |
| 14 | api_keys | Internal/external API keys. |
| 15 | oauth_accounts | OAuth provider accounts. |

### 3.2 RBAC

| # | Table | Purpose |
|---|-------|---------|
| 16 | roles | Role definitions. |
| 17 | permissions | Permission definitions. |
| 18 | user_roles | User-role assignment. |
| 19 | role_permissions | Role-permission assignment. |
| 20 | employee_roles | Employee role assignment. |
| 21 | permission_groups | Permission grouping. |
| 22 | role_hierarchy | Parent-child role rules. |
| 23 | scoped_permissions | Brand/company/customer scoped permissions. |
| 24 | policy_rules | Dynamic ABAC/policy rules. |
| 25 | access_reviews | Periodic permission review records. |

### 3.3 Brand & Tenant

| # | Table | Purpose |
|---|-------|---------|
| 26 | brands | Brand definitions. |
| 27 | brand_domains | Domains per brand. |
| 28 | brand_databases | Database connection metadata. |
| 29 | brand_themes | Theme settings. |
| 30 | brand_seo | SEO settings. |
| 31 | brand_settings | Key-value brand config. |
| 32 | brand_features | Feature flags by brand. |
| 33 | brand_locales | Languages/locales. |
| 34 | brand_assets | Logos, favicons, media. |
| 35 | brand_mail_settings | Email sender templates/settings. |

### 3.4 Employees & Organization

| # | Table | Purpose |
|---|-------|---------|
| 36 | employees | Employee records. |
| 37 | employee_profiles | Employee profile details. |
| 38 | employee_companies | Shift/company relationship. |
| 39 | employee_managers | Manager hierarchy. |
| 40 | employee_departments | Sales, Retention, Finance, Compliance, Support. |
| 41 | employee_activity | Employee activity stream. |
| 42 | employee_targets | Sales/retention targets. |
| 43 | employee_performance | KPI snapshots. |
| 44 | employee_availability | Work hours and availability. |
| 45 | employee_transfers | Transfer history between teams. |

### 3.5 Customers

| # | Table | Purpose |
|---|-------|---------|
| 46 | customers | Customer master record. |
| 47 | customer_profiles | Personal information. |
| 48 | customer_contacts | Phone, email, address. |
| 49 | customer_statuses | Sale/Retention status catalog. |
| 50 | customer_status_history | Status change history. |
| 51 | customer_comments | Employee comments. |
| 52 | customer_timeline | Unified timeline. |
| 53 | customer_tags | Tags. |
| 54 | customer_tag_links | Customer-tag join. |
| 55 | customer_assignments | Responsible employee assignment. |
| 56 | customer_transfers | Transfer from Sales to Retention/other teams. |
| 57 | customer_sources | Ad/source catalog. |
| 58 | customer_source_history | Source changes. |
| 59 | customer_notes | Extra info. |
| 60 | customer_preferences | Language, timezone, contact preferences. |
| 61 | customer_risk_profiles | Investment risk profile. |
| 62 | customer_suitability_tests | Suitability/appropriateness tests. |
| 63 | customer_agreements | Accepted agreements. |
| 64 | customer_consents | Marketing/data consents. |
| 65 | customer_blacklist | Blocked/blacklisted customers. |

### 3.6 CRM Pipeline

| # | Table | Purpose |
|---|-------|---------|
| 66 | pipelines | Pipeline definitions. |
| 67 | pipeline_stages | Pipeline stages. |
| 68 | pipeline_stage_history | Stage history. |
| 69 | lead_scores | Lead scoring records. |
| 70 | lead_assignments | Lead assignment. |
| 71 | follow_ups | Follow-up tasks. |
| 72 | follow_up_results | Follow-up outcomes. |
| 73 | callbacks | Scheduled callbacks. |
| 74 | sales_opportunities | Sales opportunities. |
| 75 | retention_cases | Retention cases. |

### 3.7 Finance

| # | Table | Purpose |
|---|-------|---------|
| 76 | wallets | Customer wallets. |
| 77 | wallet_balances | Balance snapshots. |
| 78 | deposits | Deposit records. |
| 79 | withdrawals | Withdrawal records. |
| 80 | transactions | General ledger transactions. |
| 81 | transaction_lines | Double-entry lines. |
| 82 | bonuses | Bonuses. |
| 83 | bonus_rules | Bonus rules. |
| 84 | commissions | Commission records. |
| 85 | commission_rules | Commission rules. |
| 86 | swaps | Swap charges. |
| 87 | transfers | Internal transfers. |
| 88 | payment_methods | Payment method catalog. |
| 89 | payment_providers | PSP provider records. |
| 90 | payment_callbacks | PSP callbacks. |
| 91 | payout_batches | Batch withdrawal payouts. |
| 92 | chargebacks | Chargeback records. |
| 93 | finance_approvals | Finance approval workflow. |
| 94 | finance_limits | Deposit/withdraw limits. |
| 95 | exchange_rates | Currency exchange rates. |

### 3.8 Trading / Market

| # | Table | Purpose |
|---|-------|---------|
| 96 | trading_accounts | Live/demo trading accounts. |
| 97 | trading_account_balances | Account balances. |
| 98 | trade_orders | Orders. |
| 99 | trade_order_events | Order lifecycle events. |
| 100 | trade_positions | Positions. |
| 101 | trade_executions | Fills/executions. |
| 102 | trade_deals | Closed deals. |
| 103 | margin_snapshots | Margin snapshots. |
| 104 | risk_events | Trading risk events. |
| 105 | broker_connections | Broker config metadata. |
| 106 | broker_order_refs | Broker ids and references. |
| 107 | broker_callbacks | Broker webhook events. |
| 108 | symbols | Instrument symbols. |
| 109 | exchanges | Exchange definitions. |
| 110 | forex_pairs | Forex instruments. |
| 111 | commodities | Commodity instruments. |
| 112 | indices | Index instruments. |
| 113 | stocks | Stock instruments. |
| 114 | crypto_assets | Crypto instruments. |
| 115 | market_quotes | Latest quotes. |
| 116 | market_ticks | Tick data. |
| 117 | market_candles | OHLCV candles. |
| 118 | order_books | Order book snapshots. |
| 119 | economic_events | Calendar events. |
| 120 | market_data_providers | Provider configs. |

### 3.9 Tickets & Support

| # | Table | Purpose |
|---|-------|---------|
| 121 | tickets | Ticket master. |
| 122 | ticket_messages | Ticket messages. |
| 123 | ticket_attachments | Attachments. |
| 124 | ticket_status_history | Status history. |
| 125 | ticket_categories | Categories. |
| 126 | ticket_priorities | Priorities. |
| 127 | support_threads | Live support threads. |
| 128 | support_messages | Live support messages. |
| 129 | support_participants | Thread participants. |
| 130 | support_routing_rules | Routing to responsible employee/TL. |

### 3.10 KYC & AML

| # | Table | Purpose |
|---|-------|---------|
| 131 | documents | Customer documents. |
| 132 | document_files | File metadata. |
| 133 | document_types | Document type catalog. |
| 134 | verification_statuses | Verification status. |
| 135 | kyc_cases | KYC workflow case. |
| 136 | kyc_steps | KYC step catalog. |
| 137 | kyc_step_results | Step outcomes. |
| 138 | face_verifications | Face match records. |
| 139 | address_verifications | Address verification. |
| 140 | id_card_verifications | ID card verification. |
| 141 | passport_verifications | Passport verification. |
| 142 | aml_checks | AML check records. |
| 143 | aml_watchlist_hits | Watchlist hits. |
| 144 | compliance_reviews | Compliance review. |
| 145 | compliance_decisions | Approval/rejection decisions. |

### 3.11 Campaigns & Affiliate

| # | Table | Purpose |
|---|-------|---------|
| 146 | campaigns | Campaign definitions. |
| 147 | campaign_targets | Campaign target segments. |
| 148 | campaign_history | Campaign execution history. |
| 149 | campaign_messages | Campaign messages. |
| 150 | campaign_conversions | Conversion records. |
| 151 | affiliates | Affiliate partners. |
| 152 | affiliate_links | Referral links. |
| 153 | affiliate_clicks | Click tracking. |
| 154 | affiliate_conversions | Conversion tracking. |
| 155 | affiliate_commissions | Commission payouts. |
| 156 | affiliate_revenue | Revenue tracking. |
| 157 | partner_accounts | Partner accounts. |
| 158 | partner_payments | Partner payments. |

### 3.12 CMS & Homepage Builder

| # | Table | Purpose |
|---|-------|---------|
| 159 | homepages | Homepage definitions. |
| 160 | homepage_versions | Version history. |
| 161 | homepage_blocks | Blocks. |
| 162 | homepage_block_settings | Block config. |
| 163 | hero_blocks | Hero block data. |
| 164 | slider_blocks | Slider data. |
| 165 | market_widget_blocks | Market widget data. |
| 166 | news_widget_blocks | News widget data. |
| 167 | blog_widget_blocks | Blog widget data. |
| 168 | cta_blocks | CTA block data. |
| 169 | header_blocks | Header block data. |
| 170 | footer_blocks | Footer block data. |
| 171 | pages | Static/dynamic pages. |
| 172 | page_versions | Page version history. |
| 173 | blog_posts | Blog posts. |
| 174 | blog_categories | Blog categories. |
| 175 | news_articles | News articles. |
| 176 | media_assets | Media library. |
| 177 | menus | Navigation menus. |
| 178 | menu_items | Menu items. |

### 3.13 Notifications

| # | Table | Purpose |
|---|-------|---------|
| 179 | notifications | In-app notifications. |
| 180 | notification_templates | Templates. |
| 181 | notification_preferences | User preferences. |
| 182 | email_messages | Email queue. |
| 183 | sms_messages | SMS queue. |
| 184 | push_messages | Push notification queue. |
| 185 | webhook_subscriptions | Webhooks. |
| 186 | webhook_deliveries | Delivery attempts. |

### 3.14 Audit, Security & Monitoring

| # | Table | Purpose |
|---|-------|---------|
| 187 | audit_logs | Immutable audit trail. |
| 188 | activity_logs | User activity log. |
| 189 | security_events | Security events. |
| 190 | rate_limit_events | Rate limit events. |
| 191 | ip_reputation_events | IP reputation records. |
| 192 | admin_actions | Admin action summary. |
| 193 | data_exports | Data export requests. |
| 194 | data_erasure_requests | Erasure requests. |
| 195 | consent_records | Consent records. |
| 196 | system_health_checks | Health snapshots. |
| 197 | service_metrics | Service metrics. |
| 198 | error_events | Error events. |
| 199 | background_jobs | Job records. |
| 200 | job_attempts | Job attempts. |

### 3.15 AI

| # | Table | Purpose |
|---|-------|---------|
| 201 | ai_models | Model registry. |
| 202 | ai_prompts | Prompt templates. |
| 203 | ai_lead_scores | Lead scoring output. |
| 204 | ai_customer_analysis | Customer analysis output. |
| 205 | ai_risk_scores | Risk engine output. |
| 206 | ai_campaign_recommendations | Campaign optimization output. |
| 207 | ai_ticket_suggestions | Ticket assistant output. |
| 208 | ai_chat_sessions | CRM assistant sessions. |
| 209 | ai_chat_messages | CRM assistant messages. |
| 210 | ai_feedback | Human feedback on AI results. |

### 3.16 Mobile & Future Trading

| # | Table | Purpose |
|---|-------|---------|
| 211 | mobile_devices | Mobile app devices. |
| 212 | push_tokens | Push tokens. |
| 213 | copy_trading_masters | Copy trading masters. |
| 214 | copy_trading_followers | Followers. |
| 215 | pamm_accounts | PAMM accounts. |
| 216 | pamm_allocations | PAMM allocations. |
| 217 | mam_accounts | MAM accounts. |
| 218 | mam_allocations | MAM allocations. |
| 219 | social_posts | Social trading posts. |
| 220 | social_comments | Social trading comments. |

## 4. High-Level ER Notes

- `brands` owns brand-scoped data.
- `users` is identity; `employees` and `customers` extend it in the target architecture.
- `customers` has one or many `trading_accounts`, `wallets`, `documents`, `tickets`, `support_threads`.
- `trade_orders` must link to `customers`, `trading_accounts`, `broker_order_refs`.
- `transactions` should be double-entry through `transaction_lines`.
- All sensitive actions write to `audit_logs`.
- Event-producing tables should publish to RabbitMQ in the target architecture.

## 5. Migration Strategy From Current MVP

Current D1 tables map to the enterprise target as follows:

| Current MVP | Enterprise target |
|-------------|-------------------|
| users | users + employees + customers + user_profiles |
| roles / permissions | roles / permissions / role_permissions |
| crm_trade_orders | trade_orders + broker_order_refs + trade_executions |
| crm_trade_accounts | trading_accounts |
| crm_money_transactions | deposits / withdrawals / transactions |
| crm_documents | documents / document_files |
| crm_client_comments | customer_comments |
| crm_support_messages | support_threads / support_messages |
| audit_logs | audit_logs |
| sessions | sessions + device_sessions |

## 6. Partitioning Recommendations

- `audit_logs`: monthly partition.
- `market_ticks`: daily partition by symbol/provider.
- `trade_order_events`: monthly partition.
- `activity_logs`: monthly partition.
- `notifications`: monthly partition.

## 7. Indexing Recommendations

- All foreign keys indexed.
- Composite indexes on `(brand_id, created_at)`.
- Customer search: ElasticSearch index for name, email, phone, numeric id.
- Trade orders: `(customer_id, created_at desc)`, `(symbol, created_at desc)`, `(broker_order_id)`.
- Finance: `(customer_id, created_at desc)`, `(tx_status, created_at desc)`.

## 8. Compliance Notes

- PII encryption at rest should be evaluated for high-risk fields.
- Document files should be stored in object storage, not PostgreSQL.
- AML/KYC decisions must be immutable once approved/rejected, with superseding records for changes.
- Data erasure must respect legal retention requirements.
