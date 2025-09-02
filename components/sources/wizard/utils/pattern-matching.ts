export function matchesPattern(url: string, pattern: string): boolean {
  if (!pattern || !url) return false;
  
  try {
    // Handle common pattern types
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      // Explicit regex pattern like /^\/jobs\//
      const regex = new RegExp(pattern.slice(1, -1));
      return regex.test(url);
    } else if (pattern.includes('*') || pattern.includes('?')) {
      // Glob pattern like */jobs/* or job-?.html
      const regexPattern = pattern
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
        .replace(/\\\*/g, '.*') // Convert * to .*
        .replace(/\\\?/g, '.'); // Convert ? to .
      const regex = new RegExp(regexPattern);
      return regex.test(url);
    } else if (pattern.includes('^') || pattern.includes('$') || pattern.includes('\\d') || 
               pattern.includes('\\w') || pattern.includes('\\s') || pattern.includes('[') || 
               pattern.includes('(') || pattern.includes('+') || pattern.includes('{')) {
      // Regex pattern with special characters like ^/jobs/ or /jobs/\d+
      const regex = new RegExp(pattern);
      return regex.test(url);
    } else {
      // Simple string containment for patterns like "/jobs/" or "careers"
      return url.includes(pattern);
    }
  } catch (error) {
    // Invalid regex, fall back to string containment
    return url.includes(pattern);
  }
}

export function getLinkMatchType(
  url: string, 
  linkFiltering?: { includePatterns: string[]; excludePatterns?: string[] }
): 'included' | 'excluded' | 'unmatched' {
  if (!linkFiltering) return 'unmatched';
  
  const { includePatterns = [], excludePatterns = [] } = linkFiltering;
  
  // Check exclude patterns first (they take priority)
  for (const pattern of excludePatterns) {
    if (pattern && matchesPattern(url, pattern)) {
      return 'excluded';
    }
  }
  
  // Then check include patterns
  for (const pattern of includePatterns) {
    if (pattern && matchesPattern(url, pattern)) {
      return 'included';
    }
  }
  
  return 'unmatched';
}

export function getMatchReason(
  url: string,
  linkFiltering?: { includePatterns: string[]; excludePatterns?: string[] }
): string {
  if (!linkFiltering) return 'No filtering configured';
  
  const { includePatterns = [], excludePatterns = [] } = linkFiltering;
  
  // Check exclude patterns first
  for (const pattern of excludePatterns) {
    if (pattern && matchesPattern(url, pattern)) {
      return `Excluded by pattern: ${pattern}`;
    }
  }
  
  // Then check include patterns
  for (const pattern of includePatterns) {
    if (pattern && matchesPattern(url, pattern)) {
      return `Included by pattern: ${pattern}`;
    }
  }
  
  if (includePatterns.length === 0) {
    return 'No include patterns specified';
  }
  
  return 'No matching include pattern';
}