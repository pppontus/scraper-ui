import React from "react";
import { Globe, Search, FileText, Database, Calendar, CheckCircle } from "lucide-react";

export type StepId =
  | "basics"
  | "discovery_setup"
  | "extraction_setup"
  | "llm"
  | "schedule"
  | "review";

export interface StepConfig {
  id: StepId;
  label: string;
  icon: React.ElementType;
  description: string;
}

export const ALL_STEPS: StepConfig[] = [
  { 
    id: "basics", 
    label: "Source Setup", 
    icon: Globe, 
    description: "Source information and basic setup"
  },
  { 
    id: "discovery_setup", 
    label: "Find Jobs", 
    icon: Search, 
    description: "Configure how to find job URLs"
  },
  { 
    id: "extraction_setup", 
    label: "Extract Details", 
    icon: FileText, 
    description: "Configure how to extract job details"
  },
  { id: "llm", label: "LLM Parsing", icon: Database, description: "Configure AI-powered data parsing" },
  { 
    id: "schedule", 
    label: "Schedule", 
    icon: Calendar, 
    description: "Set up discovery schedule and rate limits"
  },
  { 
    id: "review", 
    label: "Review", 
    icon: CheckCircle, 
    description: "Review and create source"
  }
];

export const LLM_MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", cost: "Low", speed: "Fast" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", cost: "High", speed: "Medium" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", cost: "Low", speed: "Fast" },
  { id: "claude-3-sonnet", name: "Claude 3 Sonnet", provider: "Anthropic", cost: "Medium", speed: "Medium" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", cost: "High", speed: "Slow" }
];

// Schema field configuration for LLM output
export interface SchemaFieldConfig {
  used: boolean;           // Whether field should be included in LLM output schema
  mandatory: boolean;      // Whether LLM must provide this field
  instructions: string;    // Instructions for LLM on how to extract this field
  dataType: string;        // Data type description
  example?: string;        // Example value for this field
}

// Complete schema with all job variables you specified
export const FULL_JOB_SCHEMA: Record<string, SchemaFieldConfig> = {
  title: {
    used: true,
    mandatory: true,
    instructions: "Extract the job title from the posting. This is usually prominently displayed at the top.",
    dataType: "string",
    example: "E-Commerce Manager"
  },
  locations: {
    used: true,
    mandatory: false,
    instructions: "Extract all work locations mentioned. Often multiple cities/offices are listed.",
    dataType: "array of strings",
    example: "Stockholm, Norrköping"
  },
  officePolicy: {
    used: false,
    mandatory: false,
    instructions: "Look for remote work policy - in office, hybrid, or remote arrangements.",
    dataType: "string (In office|Hybrid|Remote)",
    example: "Hybrid"
  },
  startDate: {
    used: false,
    mandatory: false,
    instructions: "Extract start date if specified. Look for 'ASAP' or specific dates.",
    dataType: "ISO date string",
    example: "2025-10-01"
  },
  asapStart: {
    used: false,
    mandatory: false,
    instructions: "Boolean flag if start date is 'ASAP' or immediate.",
    dataType: "boolean",
    example: "false"
  },
  assignmentLength: {
    used: false,
    mandatory: false,
    instructions: "Total assignment duration including extensions, usually in months.",
    dataType: "string",
    example: "12 months"
  },
  requirements: {
    used: true,
    mandatory: false,
    instructions: "List all required skills, technologies, and qualifications mentioned.",
    dataType: "array of strings",
    example: "Shopify, Google Analytics, SEO, SEM"
  },
  niceToHave: {
    used: false,
    mandatory: false,
    instructions: "Extract nice-to-have or preferred skills that are not mandatory.",
    dataType: "array of strings",
    example: "Python, Photoshop, Klaviyo"
  },
  description: {
    used: true,
    mandatory: false,
    instructions: "Main job description paragraph summarizing the role and responsibilities.",
    dataType: "string",
    example: "Assignment covers parental leave..."
  },
  descriptionList: {
    used: false,
    mandatory: false,
    instructions: "Extract bullet points or key responsibilities as separate items.",
    dataType: "array of strings",
    example: "Responsibility for online sales, Improve conversion"
  },
  category: {
    used: true,
    mandatory: false,
    instructions: "Primary job category that matches site navigation categories.",
    dataType: "string",
    example: "Sales & Marketing"
  },
  subcategory: {
    used: false,
    mandatory: false,
    instructions: "More specific subcategory within the main category.",
    dataType: "string",
    example: "E-commerce"
  },
  broker: {
    used: true,
    mandatory: false,
    instructions: "Name of the consulting firm or recruitment agency posting the job.",
    dataType: "string",
    example: "Emagine"
  },
  detailsLink: {
    used: true,
    mandatory: true,
    instructions: "Full URL to the original job posting for reference.",
    dataType: "string (URL)",
    example: "https://portal.emagine.org/jobs/170116"
  },
  acceptingApplications: {
    used: false,
    mandatory: false,
    instructions: "Whether the position is currently accepting new applications.",
    dataType: "boolean",
    example: "true"
  },
  endClient: {
    used: false,
    mandatory: false,
    instructions: "The final client company (often different from the broker). May be unknown.",
    dataType: "string",
    example: "Polarn O. Pyret"
  },
  applyBy: {
    used: false,
    mandatory: false,
    instructions: "Application deadline if specified in the posting.",
    dataType: "ISO date string",
    example: "2025-10-01"
  },
  workload: {
    used: false,
    mandatory: false,
    instructions: "Percentage of full-time work expected (e.g., 100%, 75%, 50%).",
    dataType: "string (percentage)",
    example: "100%"
  },
  hourlyRate: {
    used: false,
    mandatory: false,
    instructions: "Hourly compensation rate in SEK if mentioned.",
    dataType: "string",
    example: "1050 SEK"
  },
  maxHourlyRate: {
    used: false,
    mandatory: false,
    instructions: "Maximum hourly rate if a range is specified.",
    dataType: "string",
    example: "1200 SEK"
  },
  seniorityLevel: {
    used: false,
    mandatory: false,
    instructions: "Experience level: 1-2 = Junior, 3-4 = Mid, 5 = Senior",
    dataType: "number (1-5)",
    example: "3"
  },
  compensationModel: {
    used: false,
    mandatory: false,
    instructions: "How compensation is structured - hourly or per project.",
    dataType: "string (Hour|Per project)",
    example: "Hour"
  }
};

// Legacy schema for backward compatibility
export const DEFAULT_EXTRACTION_SCHEMA = {
  title: "string (required)",
  company: "string (required)", 
  location: "string",
  salary: "string",
  startDate: "ISO date string",
  requirements: "array of strings",
  description: "string"
};

export const STORAGE_KEY = 'new-source-draft';
