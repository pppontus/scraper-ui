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
