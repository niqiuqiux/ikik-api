# Changelog

All notable changes to ikik-api will be documented in this file.

This project uses release tags as the source of truth for shipped versions. Keep this file focused on public-facing changes and upgrade notes.

## 1.0.0

### New Features

- Rebranded the project as ikik-api for self-hosted AI gateway and subscription management use cases.
- Added OpenAI-compatible gateway support for multi-provider request forwarding and account-based scheduling.
- Added account pool management, API key groups, quota controls, usage records, and billing metadata.
- Added user subscription, recharge, redeem code, invitation reward, and shop/card-key workflows.
- Added admin operations for users, accounts, channels, payments, moderation, risk events, data management, and system settings.
- Added release workflow support for tagged builds, Docker images, archives, and GitHub Releases.

### Improvements

- Documented production deployment notes for reverse proxy, PostgreSQL, Redis, request size limits, CDN cache bypass, and backups.
- Added explicit security guidance for secrets, admin access, payment credentials, storage credentials, moderation credentials, and email credentials.
- Added multilingual README documents in English, Chinese, and Japanese.

### Fixes

- Fixed repository integration-test compatibility around nested ent transactions, Redis test isolation, and usage-log hydration query ordering.

### Upgrade Notes

- Back up PostgreSQL before running migrations or upgrading an existing deployment.
- Review `deploy/config.example.yaml` and keep production credentials out of git.
- If using Nginx and clients that send underscore headers, enable `underscores_in_headers on;` in the Nginx `http` block.
