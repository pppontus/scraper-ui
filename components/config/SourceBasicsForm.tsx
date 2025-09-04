import React from "react";
import { Search } from "lucide-react";
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
      
      {variant === 'wizard' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">Two-Step Scraping Approach</span>
          </div>
          <p className="text-sm text-blue-700">
            This scraper uses a two-step approach: first <strong>find jobs</strong> by discovering URLs, 
            then <strong>extract details</strong> from each job page. You'll configure the 
            technique for each step separately.
          </p>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={config.notes || ""}
          onChange={(e) => setConfig({ ...config, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any additional notes about this source..."
        />
      </div>
    </div>
  );
}