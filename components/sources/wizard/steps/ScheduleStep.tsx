import React from "react";
import { Calendar } from "lucide-react";
import { SourceConfig } from "@/lib/types";
import { ScheduleConfigForm } from "@/components/config/ScheduleConfigForm";

interface ScheduleStepProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function ScheduleStep({ config, setConfig }: ScheduleStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 p-6 border-b">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Schedule Configuration</h2>
        </div>
        
        <div className="p-6">
          <ScheduleConfigForm 
            config={config}
            setConfig={setConfig}
            variant="wizard"
          />
        </div>
      </div>
    </div>
  );
}