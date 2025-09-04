import React from "react";
import { SourceConfig } from "@/lib/types";

interface SourceBasicsFormProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
  onValidation?: (isValid: boolean) => void;
  variant?: 'wizard' | 'settings';
}

export function SourceBasicsForm({ 
  config, 
  setConfig, 
  onValidation,
  variant = 'wizard' 
}: SourceBasicsFormProps) {
  
  // Basic validation - name and siteUrl are required
  const isValid = Boolean(config.name?.trim() && config.siteUrl?.trim());
  
  // Emit validation when form changes
  React.useEffect(() => {
    onValidation?.(isValid);
  }, [isValid, onValidation]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Name
          </label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Indeed Sverige"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site URL
          </label>
          <input
            type="url"
            value={config.siteUrl}
            onChange={(e) => setConfig({ ...config, siteUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://se.indeed.com"
          />
        </div>
      </div>
      
    </div>
  );
}