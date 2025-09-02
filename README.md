# Scraper Dashboard UI

A clean, data-first internal dashboard for managing web scrapers on allakonsultuppdrag.se. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Dashboard
- KPI cards showing active gigs, additions/deletions, error rates, and costs
- Interactive charts for activity over time and source performance
- Real-time statistics with Europe/Stockholm timezone

### Sources Management
- Comprehensive list view with filtering and sorting
- Detailed configuration per source with tabbed interface
- Support for HTML, JS (Crawl4AI), and API scraping modes
- Test capabilities for each configuration step

### Source Configuration Tabs
1. **Overview** - Source metadata and active gig detection rules
2. **Discovery** - List page scraping with pagination/scroll strategies
3. **Details** - Item page navigation and content extraction
4. **LLM Parsing** - Template selection and prompt configuration
5. **Save** - Database upsert keys and soft-delete rules
6. **Schedule** - Cron expressions and rate limiting
7. **Logs** - Step-by-step execution logs
8. **History** - Run history with diff viewing

### Runs & Logs
- Global view of all scraper runs across sources
- Expandable details showing step-by-step execution
- Error tracking and cost analysis
- Payload download capabilities

### Settings
- **Notifications** - Slack and email alerts configuration
- **Defaults** - LLM models, schedules, and content selection
- **Authentication** - Single-user access control
- **Compliance** - Robots.txt and GDPR settings

### New Source Wizard
- Step-by-step configuration with validation
- Template selection for common patterns
- Test capabilities at each step
- Configuration review before creation

## Tech Stack

- **Framework**: Next.js 15.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
/app
  /sources
    /[id]     - Source detail page
    /new      - New source wizard
    page.tsx  - Sources list
  /runs       - Runs & logs page
  /settings   - Settings page
  layout.tsx  - Main layout with navigation
  page.tsx    - Dashboard home
/components
  Navigation.tsx - Sidebar navigation
/lib
  mock-data.json - Mock data for all features
  utils.ts       - Utility functions
```

## Key Features

### Crawl4AI Integration Support
- Selector configuration (CSS/XPath/JSONPath)
- Include/exclude regions
- Pagination and scroll strategies
- Page interaction scripts
- Cookie/GDPR banner handling

### Progressive Disclosure
- Raw payloads hidden by default
- Expandable JSON outputs
- Collapsible sections for better UX

### Data-First Design
- Compact tables with sortable columns
- Inline actions for quick operations
- Real-time status badges
- Cost tracking per source and run

## Notes

- Single-user system (Pontus only)
- All timestamps in Europe/Stockholm timezone
- Mock data included for demonstration
- Front-end only - no backend implementation