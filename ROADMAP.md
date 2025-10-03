# Roadmap

This document outlines features beyond the MVP, aligned with your configuration choices.

## Deferred from MVP

- Real-time collaboration in builder
  - Presence, live cursors, optimistic locking, comments
  - Realtime infra: WebSockets/Ably/Pusher; CRDT or OT model
- Custom domains and embed modes
  - CNAME setup, multi-tenant domain routing, iframe/script/embed component
- Authentication
  - Email/password, magic links, OAuth (Google/Microsoft); later SSO/SAML
  - Roles/permissions: Owner, Editor, Viewer, Analyst
- Advanced branding and theming
  - Custom CSS (role-restricted), layout modes, theme library, a11y checks
- Payments and scheduling
  - Stripe Elements step; Calendly-like slot booking integration

## Phase 2

- Collaboration with comments and versioning
- Templates and question library
- Advanced logic (quotas, randomization, piping, computed fields)
- Integrations: Slack, Google Sheets, Zapier
- Partial save/resume links with email confirmation

## Phase 3

- Payments step, scheduling step, SSO/SAML, multi-tenant orgs with seat-based billing
- Analytics deep dive and scheduled exports
- Advanced compliance features and audit log UI

## Technical backlog

- Telemetry (OpenTelemetry, Sentry)
- Backups and disaster recovery docs (RPO/RTO)
- Security hardening (CSP, rate limits, field-level encryption)