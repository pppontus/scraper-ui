export type DiscoveryTechnique = "api" | "rss" | "sitemap" | "html" | "js";
export type ExtractionTechnique = "api" | "html" | "js";

export interface DiscoveryConfig {
  // API Discovery
  api?: {
    endpoint: string;
    method: string;
    headers: Record<string, string>;
    auth: AuthConfig;
    pagination: PaginationConfig;
    responseMapping: {
      urlPath: string;
      idPath?: string;
      modifiedPath?: string;
    };
    baseUrl?: string;
  };

  // RSS/Sitemap Discovery
  feed?: {
    url: string;
    type: "rss" | "atom" | "sitemap";
    urlPattern?: string;
    lastModifiedField?: string;
  };

  // HTML/JS Discovery (Content-aware scraping with Crawl4AI)
  scraping?: {
    // Rendering configuration
    rendering: {
      technique: "html" | "js"; // JS for JavaScript-heavy sites
      timeout?: number;
      waitFor?: string; // Wait for specific element or condition
      interactions?: string[]; // Click buttons, scroll, etc.
      customJS?: string; // Custom JavaScript to execute
    };

    // Content area detection (Crawl4AI approach)
    contentArea: {
      strategy: "auto" | "selector" | "largest_content";
      selectors?: string[]; // Fallback selectors: ["main", "#content", ".listings"]
      excludeRegions?: string[]; // ["header", "footer", "nav", ".ads"]
    };

    // Pattern-based link filtering (modern approach)
    linkFiltering: {
      includePatterns: string[]; // ["/jobs/", "/uppdrag/", "\\?id=\\d+"]
      excludePatterns?: string[]; // ["/login", "#", "javascript:"]
      requireText?: boolean; // Links must have visible text
      minTextLength?: number; // Minimum text length for valid links
      contextKeywords?: string[]; // ["apply", "view", "details"] - nearby text
    };

    // Pagination handling
    pagination: {
      type: "numbered" | "next-link" | "load-more" | "infinite" | "virtual";
      maxPages?: number;
      nextSelector?: string;
      loadMoreSelector?: string;
      scrollCount?: number;
      scrollDelay?: number;
      stopCondition?: string;
    };

    // Deduplication and validation
    deduplication: {
      by: "url" | "url_normalized" | "url_and_text";
      keepFirst?: boolean;
    };
  };
}

export interface ExtractionConfig {
  // Navigation to detail page
  navigation: {
    type: "direct" | "transform" | "api";
    urlTransform?: string;
    apiEndpoint?: string;
  };

  // Rendering settings
  rendering: {
    technique: ExtractionTechnique;
    timeout?: number;
    waitFor?: string;
    interactions?: string[];
    customJS?: string;
  };

  // Legacy selector-based extraction (for backwards compatibility)
  selectors: {
    title: string;
    company?: string;
    location?: string;
    description: string;
    requirements?: string;
    salary?: string;
    deadline?: string;
    [key: string]: string | undefined;
  };

  // NEW: Crawl4AI-based content extraction
  crawl4ai: {
    enabled: boolean;
    
    // Content Selection Strategy
    contentSelection: {
      // Include specific elements/regions
      targetElements?: string[]; // ["main", ".job-content", ".description"]
      cssSelector?: string;      // Single CSS selector to scope extraction
      
      // Exclude unwanted content
      excludedTags?: string[];   // ["header", "footer", "nav", ".ads", ".related"]
      excludeExternalLinks: boolean;
      excludeExternalImages: boolean;
      excludeDomains?: string[];
      
      // Content quality filters
      wordCountThreshold?: number; // Minimum words per text block
    };
    
    // Markdown Generation Configuration
    markdownStrategy: {
      type: "raw" | "fit" | "custom";
      contentFilter?: {
        type: "pruning" | "bm25" | "llm";
        // Pruning filter options
        threshold?: number;        // Content quality threshold (0-1)
        minWordCount?: number;     // Minimum words to keep block
        // BM25 filter options  
        query?: string;           // Query for relevance-based filtering
        language?: string;        // Language for BM25 processing
        // LLM filter options
        instructions?: string;    // Custom filtering instructions
      };
    };
  };

  // NEW: Per-source LLM Configuration
  llm: {
    enabled: boolean;
    model: string;              // Model identifier (gpt-4o-mini, claude-3-haiku, etc.)
    temperature: number;        // 0-1, creativity vs consistency
    maxTokens: number;         // Response length limit
    retries: number;           // Retry count for failed requests
    
    // Extraction Instructions
    systemPrompt: string;       // Instructions for extraction
    extractionSchema: Record<string, any>; // Expected JSON schema
    outputFormat: "json" | "structured";
    
    // Quality Control
    requireAllFields: boolean;  // Whether all schema fields are required
    confidenceThreshold?: number; // Minimum confidence score (0-1)
  };

  // Legacy content selection (deprecated, use crawl4ai.contentSelection)
  contentSelection?: {
    includeElements?: string[];
    excludeElements?: string[];
    wordCountThreshold?: number;
  };

  parallelism: {
    maxConcurrent: number;
    delayBetween: number;
    retryCount: number;
  };
}

export interface AuthConfig {
  type: "none" | "apikey" | "bearer" | "basic" | "oauth2";
  apiKey?: string;
  bearer?: string;
  basic?: { username: string; password: string };
  headerName?: string;
}

export interface PaginationConfig {
  type: "none" | "page" | "offset" | "cursor" | "link";
  pageParam?: string;
  limitParam?: string;
  offsetParam?: string;
  cursorParam?: string;
  pageSize?: number;
}

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  retries: number;
  template: string;
  prompt: string;
  schema: Record<string, any>;
}

export interface SaveConfig {
  upsertKeys: string[];
  softDeleteRules: {
    textMatches?: string[];
    colorChange?: string;
    missing?: boolean;
  };
  validation: {
    requireTitle: boolean;
    requireUrl: boolean;
    skipEmptyDescription: boolean;
  };
}

export interface ScheduleConfig {
  discovery: {
    enabled: boolean;
    type: "cron" | "interval" | "manual";
    expression?: string;
    intervalMinutes?: number;
  };
  extraction: {
    enabled: boolean;
    trigger: "on_discovery" | "scheduled" | "manual";
    type?: "cron" | "interval";
    expression?: string;
    intervalMinutes?: number;
  };
  rateLimit: {
    maxRequestsPerMinute: number;
    concurrency: number;
  };
}

export interface TestResults {
  discovery?: {
    success: boolean;
    urls: string[];
    metadata: Array<{
      url: string;
      id?: string;
      title?: string;
      date?: string;
    }>;
    duration: number;
    timestamp: Date;
    errors?: string[];
  };
  extraction?: {
    success: boolean;
    samples: Array<{
      url: string;
      data: Record<string, any>;
      errors?: string[];
    }>;
    duration: number;
    timestamp: Date;
    fieldCompleteness: Record<string, number>;
  };
}

export interface SourceConfig {
  // Basic identification
  id?: string;
  name: string;
  siteUrl: string;
  notes?: string;

  // Two-step configuration
  discovery: {
    enabled: boolean;
    technique: DiscoveryTechnique;
    config: DiscoveryConfig;
  };

  extraction: {
    enabled: boolean;
    technique: ExtractionTechnique;
    config: ExtractionConfig;
  };

  // Shared configurations  
  save: SaveConfig;
  schedule: ScheduleConfig;

  // Test results (stored between steps)
  testResults?: TestResults;

  // Runtime data
  status?: "idle" | "running" | "scheduled" | "failed" | "paused" | "disabled";
  lastRun?: Date;
  nextRun?: Date;
  stats?: {
    activeJobs: number;
    discoverySuccessRate: number;
    extractionSuccessRate: number;
    avgDiscoveryDuration: number;
    avgExtractionDuration: number;
    totalCost: number;
  };
}