import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(date: string | Date) {
  const d = new Date(date)
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

export function formatCost(cost: number) {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cost)
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'running': return 'bg-blue-100 text-blue-800'
    case 'idle': return 'bg-gray-100 text-gray-800'
    case 'scheduled': return 'bg-green-100 text-green-800'
    case 'failed': return 'bg-red-100 text-red-800'
    case 'paused': return 'bg-yellow-100 text-yellow-800'
    case 'disabled': return 'bg-gray-100 text-gray-500'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'partial': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  cookies?: string;
  body?: string;
}

export function parseCurl(curlCommand: string): ParsedCurl | null {
  try {
    // Clean up the curl command
    const cleanCurl = curlCommand
      .replace(/\\\n/g, ' ')  // Remove line breaks with backslash
      .replace(/\s+/g, ' ')   // Normalize whitespace
      .trim();

    // Extract URL (first argument after 'curl')
    const urlMatch = cleanCurl.match(/curl\s+['"]*([^'">\s]+)['"]*(?:\s|$)/);
    if (!urlMatch) return null;
    
    const url = urlMatch[1];
    
    // Extract method (default to GET)
    const methodMatch = cleanCurl.match(/-X\s+(\w+)/i);
    const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';
    
    // Extract headers
    const headers: Record<string, string> = {};
    const headerMatches = cleanCurl.matchAll(/-H\s+['"](.*?)['"]/g);
    
    for (const match of headerMatches) {
      const headerLine = match[1];
      const colonIndex = headerLine.indexOf(':');
      if (colonIndex > 0) {
        const key = headerLine.substring(0, colonIndex).trim();
        const value = headerLine.substring(colonIndex + 1).trim();
        headers[key] = value;
      }
    }
    
    // Extract cookies
    const cookieMatch = cleanCurl.match(/-b\s+['"](.*?)['"]/);
    const cookies = cookieMatch ? cookieMatch[1] : undefined;
    
    // Extract body data
    const bodyMatch = cleanCurl.match(/--data(?:-raw)?\s+['"]([\s\S]*?)['"]/);
    const body = bodyMatch ? bodyMatch[1] : undefined;
    
    return {
      url,
      method,
      headers,
      cookies,
      body
    };
  } catch (error) {
    console.error('Error parsing cURL:', error);
    return null;
  }
}