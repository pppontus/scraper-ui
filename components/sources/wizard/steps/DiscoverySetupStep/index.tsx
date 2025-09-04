import React from "react";
import { Search } from "lucide-react";
import { SourceConfig } from "@/lib/types";
import { DiscoveryConfigForm } from "@/components/config/DiscoveryConfigForm";

interface DiscoverySetupStepProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function DiscoverySetupStep({ config, setConfig }: DiscoverySetupStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Discovery Configuration</h2>
        </div>
        
        <DiscoveryConfigForm 
          config={config}
          setConfig={setConfig}
          variant="wizard"
        />
      </div>
    </div>
  );
}
