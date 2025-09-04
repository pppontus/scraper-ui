import React from "react";
import { SourceConfig } from "@/lib/types";
import { LLMConfigForm } from "@/components/config/LLMConfigForm";

interface LLMStepProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function LLMStep({ config, setConfig }: LLMStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 p-6 border-b">
          <div className="h-5 w-5 text-blue-600">🤖</div>
          <h2 className="text-lg font-semibold text-gray-900">LLM Parsing</h2>
        </div>
        
        <div className="p-6">
          <LLMConfigForm 
            config={config}
            setConfig={setConfig}
            variant="wizard"
          />
        </div>
      </div>
    </div>
  );
}