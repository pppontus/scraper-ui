import React from "react";
import { SourceConfig } from "@/lib/types";
import { SourceBasicsForm } from "@/components/config/SourceBasicsForm";

interface BasicsStepProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function BasicsStep({ config, setConfig }: BasicsStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        
        <SourceBasicsForm 
          config={config}
          setConfig={setConfig}
          variant="wizard"
        />
      </div>
    </div>
  );
}