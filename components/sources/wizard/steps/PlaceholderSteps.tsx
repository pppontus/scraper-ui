import React from "react";
import { SourceConfig } from "@/lib/types";

interface StepProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function LLMStep({ config, setConfig }: StepProps) {
  return (
    <div className="text-center py-8">
      LLM Step - Coming next...
    </div>
  );
}

export function SaveStep({ config, setConfig }: StepProps) {
  return (
    <div className="text-center py-8">
      Save Step - Coming next...
    </div>
  );
}

export function ScheduleStep({ config, setConfig }: StepProps) {
  return (
    <div className="text-center py-8">
      Schedule Step - Coming next...
    </div>
  );
}

export function ReviewStep({ config }: { config: SourceConfig }) {
  return (
    <div className="text-center py-8">
      Review Step - Coming next...
    </div>
  );
}