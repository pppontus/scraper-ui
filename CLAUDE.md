# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Build & Production
npm run build        # Create production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint checks
```

## Architecture Overview

This is a **Scraper Dashboard UI** - a single-user internal dashboard for managing web scrapers on allakonsultuppdrag.se. The UI serves as a detailed specification generator for future AI backend implementation, not a working scraper.

### Core Architecture

**Next.js 15 App Router** with file-based routing:
- `/app/page.tsx` - Dashboard with KPIs and charts
- `/app/sources/` - Source management (list, detail, new wizard)
- `/app/runs/` - Execution logs
- `/app/settings/` - Configuration

**Two-Step Scraping Architecture:**
1. **Discovery** - Finding job URLs (API, RSS, Sitemap, HTML, JS)
2. **Extraction** - Getting job details (Crawl4AI → Markdown → LLM → JSON)

### Key Technical Decisions

1. **Mock Data Driven**: All functionality uses `/lib/mock-data.json` - no real API calls
2. **URL-based Wizard Navigation**: Form state persists in localStorage, steps tracked in URL params
3. **Type-First Development**: Comprehensive types in `/lib/types.ts` define entire data model
4. **Progressive Disclosure UI**: Complex configurations use collapsible sections
5. **Single Shared Component**: Only `/components/Navigation.tsx` is extracted

### Important Types & Interfaces

The entire data model is defined in `/lib/types.ts`:
- `SourceConfig` - Main configuration container
- `DiscoveryConfig` - How to find URLs (with techniques: api, rss, sitemap, html, js)
- `ExtractionConfig` - How to extract content (includes Crawl4AI and LLM configs)
- `ScheduleConfig` - Cron-based scheduling

### UI Implementation Patterns

**Forms & Wizards:**
- Multi-step wizard with URL persistence (`?step=discovery`)
- Auto-save to localStorage on every change
- Browser back/forward navigation support
- Visual JSON response picker for API configuration

**Data Display:**
- Color-coded status badges using `getStatusColor()` utility
- Europe/Stockholm timezone for all timestamps
- Swedish locale (sv-SE) for currency and date formatting
- Recharts for dashboard visualizations

### Critical Implementation Details

**API Discovery Features:**
- cURL import with auto-parsing (`parseCurl()` in utils)
- Auto-extraction of base URL from endpoints
- Visual JSONPath selector with automatic wildcard conversion (`[0]` → `[*]`)
- Support for relative URLs with base URL prefixing

**Crawl4AI Integration:**
- Content selection strategies (targetElements, excludedTags)
- Markdown generation options (raw, fit, custom)
- Content filtering (pruning, BM25, LLM-based)
- Per-source LLM model selection

### Development Guidelines

1. **When modifying forms**: Update both the type definitions and localStorage persistence
2. **For new dashboard charts**: Use Recharts components consistently
3. **Status colors**: Use `getStatusColor()` utility for consistency
4. **Date/time handling**: Always use Europe/Stockholm timezone
5. **URL navigation**: Update URL params when changing wizard steps

### Current Implementation Status

**Completed:**
- Full UI implementation with mock data
- URL-based navigation with localStorage persistence
- Visual API configuration with JSONPath selection
- Comprehensive type system for all configurations

**Not Implemented (by design):**
- Actual API calls or scraping
- Backend integration
- Authentication/authorization
- Real data persistence

The UI is intentionally a "detailed prompt" for future AI backend generation rather than a working scraper.